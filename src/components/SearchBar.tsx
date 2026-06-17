import { useState, useCallback, useMemo, useRef, useEffect } from "react";

type SearchBarProps = {
  fileContent: string;
  readerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
};

export function useSearch(fileContent: string) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query || !fileContent) return [];
    const q = query.toLowerCase();
    const text = fileContent.toLowerCase();
    const positions: number[] = [];
    let idx = 0;
    while (true) {
      const pos = text.indexOf(q, idx);
      if (pos === -1) break;
      positions.push(pos);
      idx = pos + 1;
    }
    return positions;
  }, [query, fileContent]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 当匹配数变化时重置索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [matches.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, matches.length - 1));
  }, [matches.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const scrollToMatch = useCallback(
    (reader: HTMLElement | null, matchIdx?: number) => {
      if (!reader || matches.length === 0) return;
      const idx = matchIdx ?? currentIndex;
      const pos = matches[idx];
      if (pos === undefined) return;

      // 估算行数
      const lineNumber = fileContent.substring(0, pos).split("\n").length;
      const totalLines = fileContent.split("\n").length;
      const scrollTarget =
        (lineNumber / totalLines) * reader.scrollHeight;
      reader.scrollTop = Math.max(0, scrollTarget - reader.clientHeight / 3);
    },
    [matches, fileContent, currentIndex]
  );

  return {
    query,
    setQuery,
    matches,
    currentIndex,
    setCurrentIndex,
    goNext,
    goPrev,
    scrollToMatch,
  };
}

type SearchBarUIDeps = {
  query: string;
  setQuery: (q: string) => void;
  matches: number[];
  currentIndex: number;
  goNext: () => void;
  goPrev: () => void;
  scrollToMatch: (reader: HTMLElement | null) => void;
  readerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
};

function SearchBar({
  query,
  setQuery,
  matches,
  currentIndex,
  goNext,
  goPrev,
  scrollToMatch,
  readerRef,
  onClose,
}: SearchBarUIDeps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          goPrev();
        } else {
          goNext();
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [goNext, goPrev, onClose]
  );

  // 输入变化后立即滚动到第一个匹配
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  // 当前结果变化时滚动
  useEffect(() => {
    scrollToMatch(readerRef.current);
  }, [currentIndex, scrollToMatch, readerRef]);

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="搜索…"
      />
      <span className="search-count">
        {matches.length > 0
          ? `${currentIndex + 1}/${matches.length}`
          : "0/0"}
      </span>
      <button
        className="search-btn"
        onClick={goPrev}
        disabled={matches.length === 0}
        title="上一个 (Shift+Enter)"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        className="search-btn"
        onClick={goNext}
        disabled={matches.length === 0}
        title="下一个 (Enter)"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className="search-close" onClick={onClose} title="关闭 (Escape)">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export default SearchBar;