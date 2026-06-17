import { useState } from "react";
import SettingsPanel from "./SettingsPanel";

type ToolbarProps = {
  fileName: string;
  currentFileIndex: number;
  totalFolderFiles: number;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onNavigateFile: (direction: "prev" | "next") => void;
  onSearchFile: () => void;
  onSearchFolder: () => void;
  sidebarCollapsed: boolean;
  outlineCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleOutline: () => void;
};

function Toolbar({
  fileName,
  currentFileIndex,
  totalFolderFiles,
  onOpenFile,
  onOpenFolder,
  onNavigateFile,
  onSearchFile,
  onSearchFolder,
  sidebarCollapsed,
  outlineCollapsed,
  onToggleSidebar,
  onToggleOutline,
}: ToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <span className="app-title">MarkLume</span>
        <span className="tb-separator" />
        <button className="tb-toggle-btn" onClick={onToggleSidebar} title={sidebarCollapsed ? "显示侧边栏 (Ctrl+B)" : "隐藏侧边栏 (Ctrl+B)"}>
          <svg width="18" height="14" viewBox="0 0 22 16" fill="none">
            <rect x="0.5" y="0.5" width="21" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            {!sidebarCollapsed && <line x1="6" y1="0.5" x2="6" y2="15.5" stroke="currentColor" strokeWidth="1.2"/>}
          </svg>
        </button>
        <button className="tb-toggle-btn" onClick={onToggleOutline} title={outlineCollapsed ? "显示大纲" : "隐藏大纲"}>
          <svg width="18" height="14" viewBox="0 0 22 16" fill="none">
            <rect x="0.5" y="0.5" width="21" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            {!outlineCollapsed && <line x1="16" y1="0.5" x2="16" y2="15.5" stroke="currentColor" strokeWidth="1.2"/>}
          </svg>
        </button>
      </div>
      <div className="toolbar-center">
        {fileName ? (
          <>
            <span className="file-name" title={fileName}>
              {fileName}
            </span>
            {totalFolderFiles > 0 && (
              <span className="file-nav">
                <button
                  className="nav-btn"
                  onClick={() => onNavigateFile("prev")}
                  disabled={currentFileIndex <= 0}
                  title="上一个文件"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="nav-index">
                  {currentFileIndex + 1}/{totalFolderFiles}
                </span>
                <button
                  className="nav-btn"
                  onClick={() => onNavigateFile("next")}
                  disabled={currentFileIndex >= totalFolderFiles - 1}
                  title="下一个文件"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </span>
            )}
          </>
        ) : (
          <span className="file-placeholder">未打开文件</span>
        )}
      </div>
      <div className="toolbar-right">
        <button
          className="toolbar-btn"
          onClick={onSearchFile}
          disabled={!fileName}
          title="搜索当前文件 (Ctrl+F)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={onSearchFolder}
          disabled={totalFolderFiles === 0}
          title="搜索文件夹 (Ctrl+Shift+F)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4.5c0-.83.67-1.5 1.5-1.5h2.59l1 1H11c.83 0 1.5.67 1.5 1.5v.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <circle cx="10.5" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M13 13l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={onOpenFolder}
          title="打开文件夹"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1.5 4.5c0-.83.67-1.5 1.5-1.5h3.09l1 1H13c.83 0 1.5.67 1.5 1.5v1H1.5V4.5z" fill="currentColor" opacity="0.3"/>
            <path d="M1.5 6.5v5c0 .83.67 1.5 1.5 1.5h10c.83 0 1.5-.67 1.5-1.5V6H1.5v.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M1.5 6V4.5c0-.83.67-1.5 1.5-1.5h3.09l1 1H13c.83 0 1.5.67 1.5 1.5V6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => setShowSettings(true)}
          title="设置"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M13.5 8c0 .2 0 .4-.03.6l1.5 1.17a.35.35 0 01.08.46l-1.42 2.46a.35.35 0 01-.44.15l-1.77-.71a5.34 5.34 0 01-1.04.6l-.27 1.88a.35.35 0 01-.35.3H6.23a.35.35 0 01-.35-.3l-.27-1.88a5.34 5.34 0 01-1.04-.6l-1.77.71a.35.35 0 01-.44-.15l-1.42-2.46a.35.35 0 01.08-.46l1.5-1.17c-.02-.2-.03-.4-.03-.6s.01-.4.03-.6L1.02 6.23a.35.35 0 01-.08-.46l1.42-2.46a.35.35 0 01.44-.15l1.77.71c.33-.25.68-.45 1.04-.6L5.88 1.4a.35.35 0 01.35-.3h2.84a.35.35 0 01.35.3l.27 1.88c.36.15.71.35 1.04.6l1.77-.71a.35.35 0 01.44.15l1.42 2.46a.35.35 0 01-.08.46l-1.5 1.17c.03.2.03.4.03.6z" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
        <button className="toolbar-btn" onClick={onOpenFile} title="打开文件">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span>打开文件</span>
        </button>
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </header>
  );
}

export default Toolbar;