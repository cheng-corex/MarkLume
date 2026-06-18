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
  immersive?: boolean;
  onExitImmersive?: () => void;
};

function MarkdownViewer({
  fileName,
  fileContent,
  filePath,
  onOpenFile,
  onActiveHeadingChange,
  searchFocused,
  onSearchFocusAck,
  immersive,
  onExitImmersive,
}: MarkdownViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const { settings, saveScrollPosition } = useSettings();
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

  // 恢复阅读位置 + 滚动跟踪当前标题 + 保存阅读位置
  useEffect(() => {
    const reader = readerRef.current;
    if (!reader || !fileContent) return;

    // 恢复上次阅读位置（直接从 settings 中读取）
    if (filePath) {
      const savedPos = settings.scrollPositions[filePath] ?? 0;
      if (savedPos > 0) {
        requestAnimationFrame(() => {
          reader.scrollTop = savedPos;
        });
      }
    }

    let saveTimer: number | null = null;

    const handleScroll = () => {
      // 标题跟踪
      const headings = reader.querySelectorAll("h1, h2, h3, h4, h5, h6");
      if (headings.length === 0) {
        onActiveHeadingChange(null);
      } else {
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
      }

      // 保存阅读位置（防抖 300ms）
      if (filePath) {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => {
          saveScrollPosition(filePath, reader.scrollTop);
        }, 300);
      }
    };

    reader.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      reader.removeEventListener("scroll", handleScroll);
      if (saveTimer) clearTimeout(saveTimer);
      // 离开时立即保存一次
      if (filePath) {
        saveScrollPosition(filePath, reader.scrollTop);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContent, filePath]);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 处理复制代码按钮
    const copyBtn = target.closest(".copy-btn");
    if (copyBtn) {
      const encoded = copyBtn.getAttribute("data-code");
      if (encoded) {
        try {
          const code = decodeURIComponent(atob(encoded));
          await navigator.clipboard.writeText(code);
          const btn = copyBtn as HTMLElement;
          const original = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> 已复制`;
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove("copied");
          }, 2000);
        } catch {
          // 复制失败忽略
        }
      }
      return;
    }

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

  // Escape 退出沉浸模式
  const [showImmersiveTip, setShowImmersiveTip] = useState(false);

  useEffect(() => {
    if (!immersive) return;
    // 进入沉浸模式时显示提示
    setShowImmersiveTip(true);
    const timer = setTimeout(() => setShowImmersiveTip(false), 3000);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onExitImmersive) {
        onExitImmersive();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(timer);
    };
  }, [immersive, onExitImmersive]);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    search.setQuery("");
  }, [search]);

  if (fileName && fileContent) {
    return (
      <section className={`reader-area${immersive ? " reader-immersive" : ""}`} ref={readerRef}>
        {immersive && showImmersiveTip && (
          <div className="immersive-tip">
            按 <kbd>Esc</kbd> 退出沉浸模式
          </div>
        )}
        {immersive && onExitImmersive && (
          <button className="immersive-exit-btn" onClick={onExitImmersive} title="退出沉浸模式 (Esc)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 10l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 6h8c1.1 0 2 .9 2 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            退出
          </button>
        )}
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