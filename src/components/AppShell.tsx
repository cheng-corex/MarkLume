import { useState, useCallback } from "react";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import MarkdownViewer from "./MarkdownViewer";
import OutlinePanel from "./OutlinePanel";
import FolderSearchPanel from "./FolderSearchPanel";
import type { FolderFile, TreeNode } from "../services/fileService";

type Heading = {
  level: number;
  text: string;
  id: string;
};

type AppShellProps = {
  fileName: string;
  fileContent: string;
  filePath: string;
  headings: Heading[];
  activeHeadingId: string | null;
  folderTree: TreeNode | null;
  folderFiles: FolderFile[];
  currentFilePath: string | null;
  currentFileIndex: number;
  totalFolderFiles: number;
  showFolderSearch: boolean;
  searchFocused: number;
  onOpenFile: (targetPath?: string) => void;
  onOpenFolder: () => void;
  onOpenRecent: (path: string, name: string) => void;
  onOpenFolderFile: (path: string) => void;
  onNavigateFile: (direction: "prev" | "next") => void;
  onSearchFile: () => void;
  onSearchFolder: () => void;
  onCloseFolderSearch: () => void;
  onActiveHeadingChange: (id: string | null) => void;
  onHeadingClick: (id: string) => void;
  onSearchFocusAck: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
};

function AppShell({
  fileName,
  fileContent,
  filePath,
  headings,
  activeHeadingId,
  folderTree,
  folderFiles,
  currentFilePath,
  currentFileIndex,
  totalFolderFiles,
  showFolderSearch,
  searchFocused,
  onOpenFile,
  onOpenFolder,
  onOpenRecent,
  onOpenFolderFile,
  onNavigateFile,
  onSearchFile,
  onSearchFolder,
  onCloseFolderSearch,
  onActiveHeadingChange,
  onHeadingClick,
  onSearchFocusAck,
  isBookmarked,
  onToggleBookmark,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [immersive, setImmersive] = useState(false);

  const handleToggleImmersive = useCallback(() => {
    setImmersive((v) => !v);
  }, []);

  return (
    <div className={`app-shell${immersive ? " immersive" : ""}`}>
      {!immersive && (
        <Toolbar
          fileName={fileName}
          filePath={filePath}
          currentFileIndex={currentFileIndex}
          totalFolderFiles={totalFolderFiles}
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onNavigateFile={onNavigateFile}
          onSearchFile={onSearchFile}
          onSearchFolder={onSearchFolder}
          sidebarCollapsed={sidebarCollapsed}
          outlineCollapsed={outlineCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          onToggleOutline={() => setOutlineCollapsed((v) => !v)}
          onToggleImmersive={handleToggleImmersive}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
        />
      )}
      <div className="main-content">
        {!immersive && (
          <Sidebar
            folderTree={folderTree}
            currentFilePath={currentFilePath}
            onOpenRecent={onOpenRecent}
            onOpenFolderFile={onOpenFolderFile}
            collapsed={sidebarCollapsed}
          />
        )}
        <MarkdownViewer
          fileName={fileName}
          fileContent={fileContent}
          filePath={filePath}
          onOpenFile={onOpenFile}
          onActiveHeadingChange={onActiveHeadingChange}
          searchFocused={searchFocused}
          onSearchFocusAck={onSearchFocusAck}
          immersive={immersive}
          onExitImmersive={handleToggleImmersive}
        />
        {!immersive && (
          <OutlinePanel
            headings={headings}
            activeHeadingId={activeHeadingId}
            onHeadingClick={onHeadingClick}
            collapsed={outlineCollapsed}
          />
        )}
      </div>
      {showFolderSearch && (
        <FolderSearchPanel
          folderFiles={folderFiles}
          onOpenFile={onOpenFolderFile}
          onClose={onCloseFolderSearch}
        />
      )}
    </div>
  );
}

export default AppShell;