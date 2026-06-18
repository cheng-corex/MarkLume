import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import hljs from "highlight.js";

// 从标题文本生成唯一 ID（与 extractHeadings 保持同步）
function headingTextToId(text: string, usedIds: Map<string, number>): string {
  let id = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!id) id = "heading";

  const count = usedIds.get(id) || 0;
  if (count > 0) {
    id = `${id}-${count}`;
  }
  usedIds.set(id, count + 1);
  return id;
}

const usedHeadingIds = new Map<string, number>();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: (str: string, lang: string): string => {
    let codeHtml: string;
    if (lang && hljs.getLanguage(lang)) {
      try {
        codeHtml = hljs.highlight(str, {
          language: lang,
          ignoreIllegals: true,
        }).value;
      } catch {
        codeHtml = md.utils.escapeHtml(str);
      }
    } else {
      codeHtml = md.utils.escapeHtml(str);
    }

    const encoded = btoa(encodeURIComponent(str));
    const langLabel = lang ? `<span class="code-lang-label">${lang}</span>` : "";

    return `<div class="code-block-wrapper">
  <div class="code-block-header">
    ${langLabel}
    <button class="copy-btn" data-code="${encoded}" title="复制代码">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="4.5" y="4.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M11.5 4.5V3c0-.83-.67-1.5-1.5-1.5H3c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5h1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    </button>
  </div>
  <pre class="hljs"><code>${codeHtml}</code></pre>
</div>`;
  },
});

// 自定义标题渲染：加上 id 属性，与 extractHeadings 一致
const defaultHeadingRenderer = md.renderer.rules.heading_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  // 获取标题纯文本
  const inlineToken = tokens[idx + 1];
  let text = "";
  if (inlineToken && inlineToken.type === "inline" && inlineToken.children) {
    text = inlineToken.children
      .filter((t: any) => t.type === "text" || t.type === "code_inline")
      .map((t: any) => t.content)
      .join("");
  }
  if (text) {
    const id = headingTextToId(text, usedHeadingIds);
    token.attrSet("id", id);
  }
  return defaultHeadingRenderer(tokens, idx, options, env, self);
};

// 自定义渲染：图片路径相对于文件所在目录
const defaultImageRenderer =
  md.renderer.rules.image ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const src = token.attrGet("src");
  if (src && env?.filePath && !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:")) {
    // 将相对路径转为基于文件所在目录的路径
    const path = env.filePath as string;
    const dir = path.substring(0, path.lastIndexOf("/") + 1);
    token.attrSet("src", dir + src);
  }
  return defaultImageRenderer(tokens, idx, options, env, self);
};

export type RenderOptions = {
  filePath?: string;
};

/**
 * 将 Markdown 原文渲染为安全的 HTML
 */
export function renderMarkdown(raw: string, options?: RenderOptions): string {
  usedHeadingIds.clear();
  const html = md.render(raw, options || {});
  const clean = DOMPurify.sanitize(html, {
    ADD_ATTR: ["target"],
    USE_PROFILES: { html: true },
  });
  return clean;
}

/**
 * 从 Markdown 原文提取标题（用于大纲）
 */
export function extractHeadings(raw: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const lines = raw.split("\n");
  const idCounter = new Map<string, number>();

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      let text = match[2].trim();
      // 去掉行内格式标记
      text = text.replace(/[`*~_]/g, "");

      const id = headingTextToId(text, idCounter);
      headings.push({ level, text, id });
    }
  }

  return headings;
}