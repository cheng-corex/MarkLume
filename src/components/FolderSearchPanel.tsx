import { useState, useCallback, useMemo } from "react";
import { readFile } from "../services/fileService";
import type { FolderFile } from "../services/fileService";

type FolderSearchPanelProps = {
  folderFiles: FolderFile[];
  onOpenFile: (path: string) => void;
  onClose: () => void;
};

type SearchResult = {
  file: FolderFile;
  matches: number;
  snippet: string;
};

function FolderSearchPanel({
  folderFiles,
  onOpenFile,
  onClose,
}: FolderSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const filteredByName = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return folderFiles.filter((f) =>
      f.name.toLowerCase().includes(q)
    );
  }, [folderFiles, query]);

  const handleSearch = useCallback(async () => {
    if (!query) return;
    setSearching(true);
    try {
      const q = query.toLowerCase();
      const found: SearchResult[] = [];

      // 限制搜索文件数量，避免卡死
      const maxFiles = 50;
      const toSearch = folderFiles.slice(0, maxFiles);

      for (const file of toSearch) {
        try {
          const content = await readFile(file.path);
          const text = content.content.toLowerCase();
          let idx = 0;
          let count = 0;
          while (true) {
            const pos = text.indexOf(q, idx);
            if (pos === -1) break;
            count++;
            idx = pos + 1;
          }
          if (count > 0) {
            // 提取第一个匹配的前后文
            const matchIdx = text.indexOf(q);
            const start = Math.max(0, matchIdx - 30);
            const end = Math.min(
              content.content.length,
              matchIdx + q.length + 30
            );
            let snippet = content.content.substring(start, end);
            if (start > 0) snippet = "…" + snippet;
            if (end < content.content.length) snippet += "…";
            found.push({ file, matches: count, snippet });
          }
        } catch {
          // 跳过无法读取的文件
        }
      }

      setResults(found);
    } finally {
      setSearching(false);
    }
  }, [query, folderFiles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [handleSearch, onClose]
  );

  return (
    <div className="folder-search-overlay" onClick={onClose}>
      <div
        className="folder-search-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="folder-search-header">
          <h3>搜索文件夹</h3>
          <button className="search-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="folder-search-input-row">
          <input
            className="folder-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入关键词搜索文件夹内所有文件…"
            autoFocus
          />
          <button
            className="folder-search-submit"
            onClick={handleSearch}
            disabled={searching || !query}
          >
            {searching ? "搜索中…" : "搜索"}
          </button>
        </div>

        {/* 文件名匹配提示 */}
        {query && filteredByName.length > 0 && !searching && (
          <div className="folder-search-hint">
            文件名匹配：{filteredByName.length} 个文件
          </div>
        )}

        {/* 搜索结果 */}
        <div className="folder-search-results">
          {results.length > 0 ? (
            results.map((r) => (
              <div
                key={r.file.path}
                className="folder-search-result"
                onClick={() => {
                  onOpenFile(r.file.path);
                  onClose();
                }}
              >
                <div className="fsr-header">
                  <span className="fsr-name">{r.file.relativePath}</span>
                  <span className="fsr-count">{r.matches} 处匹配</span>
                </div>
                <div className="fsr-snippet">{r.snippet}</div>
              </div>
            ))
          ) : query && !searching ? (
            <div className="folder-search-empty">未找到匹配内容</div>
          ) : (
            <div className="folder-search-hint">
              输入关键词后按 Enter 或点击搜索按钮
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FolderSearchPanel;