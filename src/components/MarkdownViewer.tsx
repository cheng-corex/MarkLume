import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { renderMarkdown } from "../services/markdownRenderer";
import { useSettings } from "../stores/settingsStore.tsx";
import SearchBar, { useSearch } from "./SearchBar";
import "../styles/markdown.css";

type MarkdownViewerProps = {
  fileName: string;
  fileContent: string;
  filePath?: string;
  onOpenFile: () => void;
  onActiveHeadingChange: (id: string | null) => void;
  searchFocused: number;
  onSearchFocusAck: () => void;
};

function MarkdownViewer({
  fileName,
  fileContent,
  filePath,
  onOpenFile,
  onActiveHeadingChange,
  searchFocused,
  onSearchFocusAck,
}: MarkdownViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  const [showSearch, setShowSearch] = useState(false);
  const search = useSearch(fileContent);

  // 响应外部 Ctrl+F 或搜索按钮
  useEffect(() => {
    if (searchFocused > 0) {
      setShowSearch(true);
      onSearchFocusAck();
    }
  }, [searchFocused, onSearchFocusAck]);

  // 全局 Ctrl+F / Ctrl+Shift+F 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        // 文件夹搜索由 Toolbar/App 处理
        return;
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        search.setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch, search]);

  const html = useMemo(() => {
    if (!fileContent) return "";
    try {
      return renderMarkdown(fileContent, { filePath });
    } catch (err) {
      console.error("Markdown 渲染失败:", err);
      return `<div style="padding: 32px; color: #999; text-align: center;">
        <p>⚠️ Markdown 渲染失败</p>
        <pre style="margin-top: 12px; font-size: 12px; color: #666;">${String(err)}</pre>
      </div>`;
    }
  }, [fileContent, filePath]);

  const contentWidthMap = {
    narrow: "660px",
    normal: "860px",
    wide: "1060px",
  };

  const contentStyle: React.CSSProperties = useMemo(
    () => ({
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      maxWidth: contentWidthMap[settings.contentWidth],
    }),
    [settings.fontSize, settings.lineHeight, settings.contentWidth]
  );

  // 滚动跟踪当前标题
  useEffect(() => {
    const reader = readerRef.current;
    if (!reader || !fileContent) return;

    const handleScroll = () => {
      const headings = reader.querySelectorAll("h1, h2, h3, h4, h5, h6");
      if (headings.length === 0) {
        onActiveHeadingChange(null);
        return;
      }

      const scrollTop = reader.scrollTop;

let closestId: string | null = null;
      let closestDist = Infinity;

      headings.forEach((h) => {
        const dist = Math.abs(h.getBoundingClientRect().top + reader.scrollTop - scrollTop);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = h.id;
        }
      });

      onActiveHeadingChange(closestId);
    };

    reader.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => reader.removeEventListener("scroll", handleScroll);
  }, [fileContent, onActiveHeadingChange]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (href.startsWith("http://") || href.startsWith("https://")) {
      e.preventDefault();
      import("@tauri-apps/plugin-shell").then(({ open }) => {
        open(href).catch(() => {
          window.open(href, "_blank", "noopener");
        });
      });
    }

    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      const el = contentRef.current?.querySelector(`#${CSS.escape(id)}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    search.setQuery("");
  }, [search]);

  if (fileName && fileContent) {
    return (
      <section className="reader-area" ref={readerRef}>
        <div
          className="markdown-content"
          ref={contentRef}
          style={contentStyle}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {showSearch && (
          <SearchBar
            query={search.query}
            setQuery={search.setQuery}
            matches={search.matches}
            currentIndex={search.currentIndex}
            goNext={search.goNext}
            goPrev={search.goPrev}
            scrollToMatch={(reader) => search.scrollToMatch(reader)}
            readerRef={readerRef}
            onClose={handleCloseSearch}
          />
        )}
      </section>
    );
  }

  return (
    <section className="reader-area">
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="4" width="48" height="56" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M20 28h24M20 36h24M20 44h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2>打开一个 Markdown 文件</h2>
        <p>点击上方"打开文件"或拖拽文件到此处开始阅读</p>
        <button className="empty-state-btn" onClick={onOpenFile}>
          选择文件
        </button>
      </div>
    </section>
  );
}

export default MarkdownViewer;