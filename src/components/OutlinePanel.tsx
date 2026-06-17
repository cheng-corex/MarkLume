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
};

function OutlinePanel({
  headings,
  activeHeadingId,
  onHeadingClick,
  collapsed,
}: OutlinePanelProps) {
  if (collapsed) {
    return <aside className="outline-panel outline-panel--collapsed" />;
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