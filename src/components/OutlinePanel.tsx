type Heading = {
  level: number;
  text: string;
  id: string;
};

type OutlinePanelProps = {
  headings: Heading[];
  activeHeadingId: string | null;
  onHeadingClick: (id: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
};

function OutlinePanel({
  headings,
  activeHeadingId,
  onHeadingClick,
  collapsed,
  onToggle,
}: OutlinePanelProps) {
  if (collapsed) {
    return (
      <div className="outline-panel outline-panel--collapsed">
        <button className="panel-toggle panel-toggle--right" onClick={onToggle} title="展开大纲">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  if (headings.length === 0) {
    return (
      <aside className="outline-panel">
        <div className="outline-section-title">大纲</div>
        <div className="outline-empty">打开文件后显示标题大纲</div>
      </aside>
    );
  }

  return (
    <aside className="outline-panel">
      <button className="panel-toggle panel-toggle--left" onClick={onToggle} title="收起大纲">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="outline-section-title">大纲</div>
      <nav className="outline-tree">
        {headings.map((h) => (
          <button
            key={h.id}
            className={`outline-item outline-level-${h.level} ${
              activeHeadingId === h.id ? "active" : ""
            }`}
            onClick={() => onHeadingClick(h.id)}
            title={h.text}
          >
            <span className="outline-dot" />
            <span className="outline-text">{h.text}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default OutlinePanel;