import { useCallback, useRef, useEffect } from "react";

export type TabData = {
  id: string;
  name: string;
  path: string;
};

type TabBarProps = {
  tabs: TabData[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onReorder?: (ids: string[]) => void;
};

function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
}: TabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 滚动激活标签到可见区域
  useEffect(() => {
    if (!containerRef.current || !activeTabId) return;
    const activeEl = containerRef.current.querySelector(
      `.tab-item[data-tab-id="${activeTabId}"]`
    ) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTabId, tabs.length]);

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (e.button === 1) {
        e.preventDefault();
        onCloseTab(id);
      }
    },
    [onCloseTab]
  );

  if (tabs.length === 0) return null;

  return (
    <div className="tab-bar" ref={containerRef}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item${activeTabId === tab.id ? " active" : ""}`}
          data-tab-id={tab.id}
          onClick={() => onSelectTab(tab.id)}
          onMouseDown={(e) => handleMiddleClick(e, tab.id)}
          title={tab.path}
        >
          <svg className="tab-icon" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 4.5C2 3.67 2.67 3 3.5 3h2.59l1 1H13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H3.5c-.83 0-1.5-.67-1.5-1.5V4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span className="tab-name">{tab.name}</span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
            title="关闭 (Ctrl+W)"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default TabBar;
