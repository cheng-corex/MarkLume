import { useState, useCallback } from "react";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import MarkdownViewer from "./MarkdownViewer";
import OutlinePanel from "./OutlinePanel";
import FolderSearchPanel from "./FolderSearchPanel";
import ContextMenu from "./ContextMenu";
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
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleToggleImmersive = useCallback(() => {
    setImmersive((v) => !v);
  }, []);

  return (
    <div className={`app-shell${immersive ? " immersive" : ""}`}>
      {!immersive && (
        <Toolbar
          fileName={fileName}
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
        />
      )}
      <div className="main-content" onContextMenu={handleContextMenu}>
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
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={[
            {
              label: "打开文件",
              icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                </svg>
              ),
              onClick: () => onOpenFile(),
            },
            {
              label: "打开文件夹",
              icon: (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M1.5 4.5c0-.83.67-1.5 1.5-1.5h3.09l1 1H13c.83 0 1.5.67 1.5 1.5v1H1.5V4.5z" fill="currentColor" opacity="0.3"/>
                  <path d="M1.5 6.5v5c0 .83.67 1.5 1.5 1.5h10c.83 0 1.5-.67 1.5-1.5V6H1.5v.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <path d="M1.5 6V4.5c0-.83.67-1.5 1.5-1.5h3.09l1 1H13c.83 0 1.5.67 1.5 1.5V6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                </svg>
              ),
              onClick: () => onOpenFolder(),
            },
          ]}
        />
      )}
    </div>
  );
}

export default AppShell;