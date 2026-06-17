# MarkLume - 轻量级 Markdown 阅读器

一个基于 Tauri 2 + React + TypeScript 的轻量级 Windows Markdown 阅读程序。

## 项目目标

开发一个可以安装到 Windows 的轻量级 Markdown 阅读程序，主要用于本地阅读 `.md`、`.markdown`、`.txt` 文件。

第一版只做"阅读器"，不做复杂编辑器，不做云同步，不做协作功能。

### 目标特点

1. 启动快
2. 安装包小
3. 内存占用低
4. 支持本地 Markdown 文件阅读
5. 支持目录、大纲、主题、字号、最近文件
6. 后续可扩展为项目文档阅读器、小说阅读器、知识库阅读器

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2 |
| 前端构建 | Vite |
| 前端语言 | TypeScript |
| UI 框架 | React |
| Markdown 解析 | markdown-it |
| HTML 安全过滤 | DOMPurify |
| 代码高亮 | highlight.js |
| 本地配置 | JSON 文件 |
| 打包方式 | Tauri Windows Bundle |

## 项目结构

```
MarkLume/
├─ package.json
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ styles/
│  │  ├─ global.css
│  │  ├─ markdown.css
│  │  └─ themes.css
│  ├─ components/
│  │  ├─ AppShell.tsx
│  │  ├─ Toolbar.tsx
│  │  ├─ Sidebar.tsx
│  │  ├─ MarkdownViewer.tsx
│  │  ├─ OutlinePanel.tsx
│  │  ├─ SearchPanel.tsx
│  │  ├─ RecentFiles.tsx
│  │  └─ SettingsPanel.tsx
│  ├─ services/
│  │  ├─ markdownRenderer.ts
│  │  ├─ fileService.ts
│  │  ├─ configService.ts
│  │  ├─ outlineService.ts
│  │  └─ searchService.ts
│  ├─ stores/
│  │  ├─ appStore.ts
│  │  ├─ fileStore.ts
│  │  └─ settingsStore.ts
│  └─ types/
│     ├─ file.ts
│     ├─ settings.ts
│     ├─ outline.ts
│     └─ search.ts
│
├─ src-tauri/
│  ├─ Cargo.toml
│  ├─ tauri.conf.json
│  ├─ icons/
│  └─ src/
│     ├─ main.rs
│     ├─ commands.rs
│     ├─ file_system.rs
│     ├─ config.rs
│     └─ security.rs
│
└─ docs/
   ├─ README.md
   ├─ feature-spec.md
   ├─ implementation-plan.md
   ├─ task-plan.md
   ├─ progress.md
   ├─ test-checklist.md
   └─ build-and-release.md
```

## 开发环境要求

- Node.js 18+
- Rust 1.70+
- pnpm (推荐) 或 npm
- Windows 系统 (目标平台)