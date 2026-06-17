import { useState, useCallback } from "react";
import { useSettings } from "../stores/settingsStore.tsx";
import type { TreeNode } from "../services/fileService";

type SidebarProps = {
  folderTree: TreeNode | null;
  currentFilePath: string | null;
  onOpenRecent: (path: string, name: string) => void;
  onOpenFolderFile: (path: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
};

type TreeNodeItemProps = {
  node: TreeNode;
  depth: number;
  currentFilePath: string | null;
  onOpenFile: (path: string) => void;
};

function TreeNodeItem({ node, depth, currentFilePath, onOpenFile }: TreeNodeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  const handleClick = useCallback(() => {
    if (node.is_dir) {
      setExpanded((prev) => !prev);
    } else {
      onOpenFile(node.path);
    }
  }, [node, onOpenFile]);

  return (
    <>
      <div
        className={`tree-item${!node.is_dir && currentFilePath === node.path ? " active" : ""}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleClick}
        title={node.is_dir ? node.path : node.name}
      >
        {node.is_dir ? (
          <svg className="tree-icon tree-folder-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
            {expanded ? (
              <>
                <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H12c.83 0 1.5.67 1.5 1.5v1H2V4.5z" fill="currentColor" opacity="0.3"/>
                <path d="M2 6.5v5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V6H2v.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M2 6V4.5c0-.83.67-1.5 1.5-1.5h3.09l1 1H12c.83 0 1.5.67 1.5 1.5V6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </>
            ) : (
              <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            )}
          </svg>
        ) : (
          <svg className="tree-icon tree-file-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
        )}
        <span className="tree-item-name">{node.name}</span>
      </div>
      {node.is_dir && expanded && hasChildren && (
        <div className="tree-children">
          {(node.children || []).map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              currentFilePath={currentFilePath}
              onOpenFile={onOpenFile}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Sidebar({
  folderTree,
  currentFilePath,
  onOpenRecent,
  onOpenFolderFile,
  collapsed,
  onToggle,
}: SidebarProps) {
  const { settings } = useSettings();

  if (collapsed) {
    return <aside className="sidebar sidebar--collapsed" />;
  }

  return (
    <aside className="sidebar">
      {folderTree && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6, verticalAlign: -1 }}>
              <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" opacity="0.2"/>
            </svg>
            {folderTree.name}
          </div>
          <div className="tree-view">
            {(folderTree.children || []).map((child) => (
              <TreeNodeItem
                key={child.path}
                node={child}
                depth={0}
                currentFilePath={currentFilePath}
                onOpenFile={onOpenFolderFile}
              />
            ))}
          </div>
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