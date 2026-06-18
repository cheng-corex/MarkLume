import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import AppShell from "./components/AppShell";
import { SettingsProvider, useSettings } from "./stores/settingsStore.tsx";
import {
  pickMarkdownFile,
  pickFolder,
  readFile,
  scanFolderTree,
  flattenTree,
  type FileContent,
  type FolderFile,
  type TreeNode,
} from "./services/fileService";
import { extractHeadings } from "./services/markdownRenderer";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { type TabData } from "./components/TabBar";
import "./styles/global.css";

type TabState = {
  id: string;
  file: FileContent;
  headings: ReturnType<typeof extractHeadings>;
  activeHeadingId: string | null;
  searchFocused: number;
};

function AppInner() {
  const { addRecentFile, updateSettings, settings, toggleBookmark, isBookmarked } = useSettings();

  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(-1);
  const [folderTree, setFolderTree] = useState<TreeNode | null>(null);
  const [showFolderSearch, setShowFolderSearch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<number | null>(null);

  const activeTab = activeTabIndex >= 0 && activeTabIndex < tabs.length ? tabs[activeTabIndex] : null;
  const file = activeTab?.file ?? null;
  const headings = activeTab?.headings ?? [];
  const activeHeadingId = activeTab?.activeHeadingId ?? null;
  const searchFocused = activeTab?.searchFocused ?? 0;

  // 从树结构派生平铺文件列表
  const folderFiles: FolderFile[] = useMemo(() => {
    return folderTree ? flattenTree(folderTree) : [];
  }, [folderTree]);

  // 打开/切换到标签
  const openFileInTab = useCallback(async (filePath: string) => {
    try {
      const content = await readFile(filePath);
      setTabs((prev) => {
        const existing = prev.findIndex((t) => t.id === filePath);
        const newTab: TabState = {
          id: filePath,
          file: content,
          headings: extractHeadings(content.content),
          activeHeadingId: null,
          searchFocused: 0,
        };
        if (existing >= 0) {
          // 更新已有标签内容（用于刷新）
          const updated = [...prev];
          updated[existing] = newTab;
          setActiveTabIndex(existing);
          return updated;
        }
        setActiveTabIndex(prev.length);
        return [...prev, newTab];
      });
      addRecentFile(filePath, content.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`无法打开文件：${message}`);
    }
  }, [addRecentFile]);

  // 标签列表供 TabBar 使用
  const tabDataList: TabData[] = useMemo(() => {
    return tabs.map((t) => ({
      id: t.id,
      name: t.file.name,
      path: t.file.path,
    }));
  }, [tabs]);

  const currentIndex = useMemo(() => {
    if (!file || folderFiles.length === 0) return -1;
    return folderFiles.findIndex((f) => f.path === file.path);
  }, [file, folderFiles]);

  // 启动时恢复
  useEffect(() => {
    let cancelled = false;

    // 监听从 Rust 端发来的文件打开事件（单实例/双击文件关联）
    const unlistenPromise = listen<string>("file-opened", (event) => {
      if (!cancelled) {
        openFileInTab(event.payload);
      }
    });

    // 同时恢复上次的文件夹
    const restore = async () => {
      if (!settings.lastOpenedFolder) return;
      try {
        const tree = await scanFolderTree(settings.lastOpenedFolder);
        if (cancelled) return;
        setFolderTree(tree);
      } catch { /* ignore */ }
    };
    restore();

    return () => {
      cancelled = true;
      unlistenPromise.then((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 拖拽
  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();
    let unlisten: (() => void) | undefined;
    appWindow.onDragDropEvent((event) => {
      const { type } = event.payload;
      if (type === "over") {
        if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = window.setTimeout(() => setIsDragging(true), 100);
      } else if (type === "leave") {
        setIsDragging(false);
        if (dragTimeoutRef.current) { clearTimeout(dragTimeoutRef.current); dragTimeoutRef.current = null; }
      } else if (type === "drop") {
        setIsDragging(false);
        if (dragTimeoutRef.current) { clearTimeout(dragTimeoutRef.current); dragTimeoutRef.current = null; }
        const paths = event.payload.paths;
        if (paths?.length > 0) {
          const filePath = paths[0];
          const ext = filePath.split(".").pop()?.toLowerCase();
          if (ext && ["md", "markdown", "txt"].includes(ext)) {
            openFileInTab(filePath);
          } else {
            alert("仅支持 .md、.markdown、.txt 文件");
          }
        }
      }
    }).then((fn) => { unlisten = fn; });
    return () => {
      unlisten?.();
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    };
  }, [openFileInTab]);

  // 文件变更自动检测
  useEffect(() => {
    if (!file?.path) return;
    let cancelled = false;
    let lastModTime = file.modifiedAt;
    const timer = setInterval(async () => {
      try {
        const modTime = await invoke<number>("get_file_modified_time", { path: file.path });
        if (cancelled) return;
        if (modTime > lastModTime) {
          lastModTime = modTime;
          await openFileInTab(file.path);
        }
      } catch { /* ignore */ }
    }, 2000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [file?.path, openFileInTab]);

  // Ctrl+Shift+F
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        if (folderFiles.length > 0) setShowFolderSearch((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [folderFiles.length]);

  const navigateFile = useCallback((direction: "prev" | "next") => {
    if (folderFiles.length === 0 || currentIndex === -1) return;
    const nextIndex = direction === "next"
      ? Math.min(currentIndex + 1, folderFiles.length - 1)
      : Math.max(currentIndex - 1, 0);
    if (nextIndex === currentIndex) return;
    openFileInTab(folderFiles[nextIndex].path);
  }, [folderFiles, currentIndex, openFileInTab]);

  const handleOpenFile = useCallback(async (targetPath?: string) => {
    const filePath = (typeof targetPath === "string" ? targetPath : undefined) || (await pickMarkdownFile());
    if (filePath) await openFileInTab(filePath);
  }, [openFileInTab]);

  const handleOpenFolder = useCallback(async () => {
    try {
      const dirPath = await pickFolder();
      if (!dirPath) return;
      const tree = await scanFolderTree(dirPath);
      setFolderTree(tree);
      updateSettings({ lastOpenedFolder: dirPath });
      const files = flattenTree(tree);
      if (files.length > 0) await openFileInTab(files[0].path);
    } catch (err) {
      alert(`打开文件夹失败：${err}`);
    }
  }, [openFileInTab, updateSettings]);

  const handleOpenRecent = useCallback((path: string, name: string) => {
    openFileInTab(path);
  }, [openFileInTab]);

  const handleOpenFolderFile = useCallback((path: string) => {
    openFileInTab(path);
  }, [openFileInTab]);

  const handleSelectTab = useCallback((id: string) => {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx >= 0) setActiveTabIndex(idx);
  }, [tabs]);

  const handleCloseTab = useCallback((id: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const updated = prev.filter((_, i) => i !== idx);
      if (activeTabIndex >= updated.length) {
        setActiveTabIndex(Math.max(0, updated.length - 1));
      } else if (activeTabIndex === idx) {
        setActiveTabIndex(Math.min(idx, updated.length - 1));
      }
      return updated;
    });
  }, [activeTabIndex]);

  const handleHeadingClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const setActiveHeadingId = useCallback((id: string | null) => {
    setTabs((prev) => {
      if (activeTabIndex < 0 || activeTabIndex >= prev.length) return prev;
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], activeHeadingId: id };
      return updated;
    });
  }, [activeTabIndex]);

  const handleSearchFile = useCallback(() => {
    setTabs((prev) => {
      if (activeTabIndex < 0 || activeTabIndex >= prev.length) return prev;
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], searchFocused: updated[activeTabIndex].searchFocused + 1 };
      return updated;
    });
  }, [activeTabIndex]);

  const handleSearchFocusAck = useCallback(() => {
    setTabs((prev) => {
      if (activeTabIndex < 0 || activeTabIndex >= prev.length) return prev;
      const updated = [...prev];
      updated[activeTabIndex] = { ...updated[activeTabIndex], searchFocused: 0 };
      return updated;
    });
  }, [activeTabIndex]);

  return (
    <>
    <AppShell
      fileName={file?.name ?? ""}
      fileContent={file?.content ?? ""}
      filePath={file?.path ?? ""}
      headings={headings}
      activeHeadingId={activeHeadingId}
      folderTree={folderTree}
      folderFiles={folderFiles}
      currentFilePath={file?.path ?? null}
      currentFileIndex={currentIndex}
      totalFolderFiles={folderFiles.length}
      showFolderSearch={showFolderSearch}
      searchFocused={searchFocused}
      onOpenFile={handleOpenFile}
      onOpenFolder={handleOpenFolder}
      onOpenRecent={handleOpenRecent}
      onOpenFolderFile={handleOpenFolderFile}
      onNavigateFile={navigateFile}
      onSearchFile={handleSearchFile}
      onSearchFolder={() => setShowFolderSearch((prev) => !prev)}
      onCloseFolderSearch={() => setShowFolderSearch(false)}
      onActiveHeadingChange={setActiveHeadingId}
      onHeadingClick={handleHeadingClick}
      onSearchFocusAck={handleSearchFocusAck}
      isBookmarked={file ? isBookmarked(file.path) : false}
      onToggleBookmark={() => file && toggleBookmark(file.path, file.name)}
      tabs={tabDataList}
      activeTabId={activeTab?.id ?? null}
      onSelectTab={handleSelectTab}
      onCloseTab={handleCloseTab}
    />
    {isDragging && (
      <div className="drag-overlay">
        <div className="drag-overlay-content">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M16 20h16M16 28h16M16 36h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 10l-6 6h4v8h4v-8h4l-6-6z" fill="currentColor" opacity="0.6"/>
          </svg>
          <h3>释放以打开文件</h3>
          <p>支持 .md、.markdown、.txt 格式</p>
        </div>
      </div>
    )}
  </>
  );
}

function App() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener("contextmenu", handler);
    return () => window.removeEventListener("contextmenu", handler);
  }, []);

  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

export default App;