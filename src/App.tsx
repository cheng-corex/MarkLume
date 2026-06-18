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
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./styles/global.css";

function AppInner() {
  const [file, setFile] = useState<FileContent | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [folderTree, setFolderTree] = useState<TreeNode | null>(null);
  const [showFolderSearch, setShowFolderSearch] = useState(false);
  const [searchFocused, setSearchFocused] = useState(0);
  const { addRecentFile, updateSettings, settings } = useSettings();

  // 从树结构派生平铺文件列表（用于导航和搜索）
  const folderFiles: FolderFile[] = useMemo(() => {
    return folderTree ? flattenTree(folderTree) : [];
  }, [folderTree]);

  // 记录最后打开的文件夹路径（用于下次启动恢复）
  const [lastOpenedFolderPath, setLastOpenedFolderPath] = useState<string | null>(null);

  // 启动时恢复上次文件夹和文件
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 1. 先检查是否通过双击文件打开
      let initialFilePath: string | null = null;
      try {
        initialFilePath = await invoke<string | null>("get_initial_file");
      } catch {
        // 忽略
      }

      if (cancelled) return;

      // 如果有初始文件（双击打开），优先打开它
      if (initialFilePath) {
        try {
          const content = await readFile(initialFilePath);
          if (cancelled) return;
          setFile(content);
          addRecentFile(initialFilePath, content.name);
        } catch {
          // 读取失败，忽略
        }
        return;
      }

      // 2. 没有初始文件，恢复上次的文件夹
      if (!settings.lastOpenedFolder) return;
      try {
        const tree = await scanFolderTree(settings.lastOpenedFolder);
        if (cancelled) return;
        setFolderTree(tree);
        if (settings.lastOpenedFile) {
          const flatFiles = flattenTree(tree);
          const exists = flatFiles.some((f) => f.path === settings.lastOpenedFile);
          if (exists) {
            const content = await readFile(settings.lastOpenedFile!);
            if (cancelled) return;
            setFile(content);
          }
        }
      } catch {
        // 文件夹可能已被删除
      }
    };

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 拖拽文件到窗口打开
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();
    let unlisten: (() => void) | undefined;

    appWindow.onDragDropEvent((event) => {
      const { type } = event.payload;

      if (type === "over") {
        // 延迟显示拖拽提示，避免闪烁
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }
        dragTimeoutRef.current = window.setTimeout(() => setIsDragging(true), 100);
      } else if (type === "leave") {
        setIsDragging(false);
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      } else if (type === "drop") {
        setIsDragging(false);
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }

        const paths = event.payload.paths;
        if (paths && paths.length > 0) {
          const filePath = paths[0];
          // 检查扩展名
          const ext = filePath.split(".").pop()?.toLowerCase();
          const allowed = ["md", "markdown", "txt"];
          if (ext && allowed.includes(ext)) {
            readFile(filePath)
              .then((content) => {
                setFile(content);
                addRecentFile(filePath, content.name);
                setActiveHeadingId(null);
              })
              .catch((err) => {
                alert(`无法打开文件：${err}`);
              });
          } else {
            alert("仅支持 .md、.markdown、.txt 文件");
          }
        }
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [addRecentFile]);

  // 文件变更自动检测（轮询 2 秒）
  useEffect(() => {
    if (!file?.path) return;
    let cancelled = false;
    let lastModTime = file.modifiedAt;

    const checkForChanges = async () => {
      try {
        const modTime = await invoke<number>("get_file_modified_time", { path: file.path });
        if (cancelled) return;
        if (modTime > lastModTime) {
          lastModTime = modTime;
          const content = await readFile(file.path);
          if (!cancelled) {
            setFile(content);
            addRecentFile(file.path, content.name);
          }
        }
      } catch {
        // 文件可能已被删除等
      }
    };

    const timer = setInterval(checkForChanges, 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [file?.path, addRecentFile]);

  // 全局 Ctrl+Shift+F 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        if (folderFiles.length > 0) {
          setShowFolderSearch((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [folderFiles.length]);

  const currentIndex = useMemo(() => {
    if (!file || folderFiles.length === 0) return -1;
    return folderFiles.findIndex((f) => f.path === file.path);
  }, [file, folderFiles]);

  const headings = useMemo(() => {
    if (!file?.content) return [];
    return extractHeadings(file.content);
  }, [file?.content]);

  const navigateFile = useCallback(
    (direction: "prev" | "next") => {
      if (folderFiles.length === 0 || currentIndex === -1) return;
      const nextIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, folderFiles.length - 1)
          : Math.max(currentIndex - 1, 0);
      if (nextIndex === currentIndex) return;
      const target = folderFiles[nextIndex];
      readFile(target.path)
        .then((content) => {
          setFile(content);
          addRecentFile(target.path, content.name);
          setActiveHeadingId(null);
        })
        .catch((err) => alert(`无法打开文件：${err}`));
    },
    [folderFiles, currentIndex, addRecentFile]
  );

  const handleOpenFile = useCallback(
    async (targetPath?: string) => {
      try {
        // 防止 onClick 把事件对象传进来
        const filePath = (typeof targetPath === "string" ? targetPath : undefined) || (await pickMarkdownFile());
        if (!filePath) return;

        const content = await readFile(filePath);
        setFile(content);
        addRecentFile(filePath, content.name);
        setActiveHeadingId(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert(`打开文件失败：${message}`);
      }
    },
    [addRecentFile]
  );

  const handleOpenFolder = useCallback(async () => {
    try {
      const dirPath = await pickFolder();
      if (!dirPath) return;

      const tree = await scanFolderTree(dirPath);
      setFolderTree(tree);
      setLastOpenedFolderPath(dirPath);
      updateSettings({ lastOpenedFolder: dirPath });

      const files = flattenTree(tree);
      if (files.length > 0) {
        const content = await readFile(files[0].path);
        setFile(content);
        addRecentFile(files[0].path, content.name);
        setActiveHeadingId(null);
      } else {
        setFile(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`打开文件夹失败：${message}`);
    }
  }, [addRecentFile, updateSettings]);

  const handleOpenRecent = useCallback(
    (path: string, name: string) => {
      readFile(path)
        .then((content) => {
          setFile(content);
          addRecentFile(path, name);
          setActiveHeadingId(null);
        })
        .catch((err) => alert(`无法打开文件：${err}`));
    },
    [addRecentFile]
  );

  const handleOpenFolderFile = useCallback(
    (path: string) => {
      readFile(path)
        .then((content) => {
          setFile(content);
          addRecentFile(path, content.name);
          setActiveHeadingId(null);
        })
        .catch((err) => alert(`无法打开文件：${err}`));
    },
    [addRecentFile]
  );

  const handleHeadingClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSearchFile = useCallback(() => {
    setSearchFocused((prev) => prev + 1);
  }, []);

  const handleSearchFocusAck = useCallback(() => {
    setSearchFocused(0);
  }, []);

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
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

export default App;