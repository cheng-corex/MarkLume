import { useState } from "react";
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

  return (
    <div className="app-shell">
      <Toolbar
        fileName={fileName}
        currentFileIndex={currentFileIndex}
        totalFolderFiles={totalFolderFiles}
        onOpenFile={onOpenFile}
        onOpenFolder={onOpenFolder}
        onNavigateFile={onNavigateFile}
        onSearchFile={onSearchFile}
        onSearchFolder={onSearchFolder}
      />
      <div className="main-content">
        <Sidebar
          folderTree={folderTree}
          currentFilePath={currentFilePath}
          onOpenRecent={onOpenRecent}
          onOpenFolderFile={onOpenFolderFile}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
        <MarkdownViewer
          fileName={fileName}
          fileContent={fileContent}
          filePath={filePath}
          onOpenFile={onOpenFile}
          onActiveHeadingChange={onActiveHeadingChange}
          searchFocused={searchFocused}
          onSearchFocusAck={onSearchFocusAck}
        />
        <OutlinePanel
          headings={headings}
          activeHeadingId={activeHeadingId}
          onHeadingClick={onHeadingClick}
          collapsed={outlineCollapsed}
          onToggle={() => setOutlineCollapsed((v) => !v)}
        />
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