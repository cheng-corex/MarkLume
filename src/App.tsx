import { useState, useCallback, useEffect, useMemo } from "react";
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
    // 1. 恢复上次打开的文件夹
    const restoreLastFolder = async () => {
      if (!settings.lastOpenedFolder) return;
      try {
        const tree = await scanFolderTree(settings.lastOpenedFolder);
        setFolderTree(tree);
        setLastOpenedFolderPath(settings.lastOpenedFolder);
        if (settings.lastOpenedFile) {
          const flatFiles = flattenTree(tree);
          const exists = flatFiles.some((f) => f.path === settings.lastOpenedFile);
          if (exists) {
            const content = await readFile(settings.lastOpenedFile!);
            setFile(content);
            return;
          }
        }
      } catch {
        // 文件夹可能已被删除
      }
    };

    // 2. 检查是通过文件关联启动的（双击 .md 文件打开）
    const checkInitialFile = async () => {
      try {
        const initialPath = await invoke<string | null>("get_initial_file");
        if (initialPath) {
          const content = await readFile(initialPath);
          setFile(content);
          addRecentFile(initialPath, content.name);
        }
      } catch {
        // 忽略
      }
    };

    restoreLastFolder();
    checkInitialFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const filePath = targetPath || (await pickMarkdownFile());
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