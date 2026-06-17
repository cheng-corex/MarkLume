import { useSettings } from "../stores/settingsStore.tsx";
import type { FolderFile } from "../services/fileService";

type SidebarProps = {
  folderFiles: FolderFile[];
  currentFilePath: string | null;
  onOpenRecent: (path: string, name: string) => void;
  onOpenFolderFile: (path: string) => void;
};

function Sidebar({
  folderFiles,
  currentFilePath,
  onOpenRecent,
  onOpenFolderFile,
}: SidebarProps) {
  const { settings } = useSettings();

  return (
    <aside className="sidebar">
      {folderFiles.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">文件夹文件</div>
          <ul className="folder-files-list">
            {folderFiles.map((f) => (
              <li
                key={f.path}
                className={`folder-file-item${
                  currentFilePath === f.path ? " active" : ""
                }`}
                title={f.relativePath}
                onClick={() => onOpenFolderFile(f.path)}
              >
                <svg
                  className="folder-file-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                  />
                </svg>
                <span className="folder-file-name">{f.relativePath}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-section-title">最近文件</div>
        {settings.recentFiles.length === 0 ? (
          <div className="sidebar-empty">暂无最近文件</div>
        ) : (
          <ul className="recent-files-list">
            {settings.recentFiles.map((f) => (
              <li
                key={f.path}
                className="recent-file-item"
                title={f.path}
                onClick={() => onOpenRecent(f.path, f.name)}
              >
                <svg
                  className="recent-file-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                  />
                </svg>
                <span className="recent-file-name">{f.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;