<div align="center">
  <img src="src-tauri/icons/app-icon.svg" width="96" height="96" alt="MarkLume Logo"/>
  <h1>MarkLume</h1>
  <p><strong>轻量级本地 Markdown 阅读器</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Tauri-2.11-FFC131?style=flat-square&logo=tauri" alt="Tauri 2.11"/>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React 18.3"/>
    <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5.5"/>
    <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite" alt="Vite 5.4"/>
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"/>
  </p>
  <p>
    <a href="#features">功能</a> •
    <a href="#screenshots">截图</a> •
    <a href="#quick-start">快速开始</a> •
    <a href="#development">开发</a> •
    <a href="#roadmap">路线图</a> •
    <a href="#contributing">贡献</a>
  </p>
</div>

---

<div align="center">
  <strong>MarkLume</strong>（读作 /mɑːrk-luːm/）是一款基于 <strong>Tauri 2</strong> 的 Windows 本地 Markdown 阅读器。
  它启动快、安装包小、内存占用低，专注于纯粹的阅读体验。
</div>

<br/>

## ✨ 功能

- ✅ **打开 .md / .markdown / .txt 文件** — 系统原生文件对话框
- ✅ **文件夹浏览** — 树形目录结构，支持折叠/展开
- ✅ **Markdown 渲染** — 标题 / 列表 / 代码高亮 / 表格 / 引用 / 图片
- ✅ **大纲导航** — 右侧标题树，点击跳转，滚动跟踪
- ✅ **暗色/亮色主题** — 跟随系统或手动切换
- ✅ **字体调整** — 字号、行高、内容宽度可调
- ✅ **全文件搜索** — Ctrl+F 当前文件，Ctrl+Shift+F 搜索文件夹
- ✅ **最近文件** — 自动记录，最多 20 个
- ✅ **启动恢复** — 自动恢复上次打开的文件夹和文件
- ✅ **文件关联** — 双击 .md 文件直接打开
- ✅ **右键菜单** — 快速打开文件/文件夹
- ✅ **面板切换** — 侧边栏和右侧大纲可折叠
- ✅ **安全过滤** — DOMPurify 清洗 HTML，防止 XSS

## 📸 截图

> 截图待补充。欢迎提交 PR 添加截图！

<details>
<summary><b>📱 应用概览</b></summary>

| 亮色模式 | 暗色模式 |
|---------|---------|
| *[截图待添加]* | *[截图待添加]* |

</details>

## 🚀 快速开始

### 下载安装

从 [Releases 页面](https://github.com/cheng-corex/MarkLume/releases) 下载最新版安装包：

```bash
# 下载 MarkLume_0.3.0_x64-setup.exe
# 双击安装即可使用
```

### 从源码构建

```bash
# 1. 克隆仓库
git clone https://github.com/cheng-corex/MarkLume.git
cd MarkLume

# 2. 安装依赖
npm install

# 3. 启动开发模式（浏览器预览）
npm run dev

# 4. 启动桌面应用
npm run tauri dev

# 5. 生产构建
npm run tauri build
```

生成的可执行文件路径：
```
src-tauri/target/release/bundle/nsis/MarkLume_x.x.x_x64-setup.exe
```

### 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | 18+ |
| Rust 工具链 | 1.70+ |
| Windows | 10 / 11 |
| NSIS | 3.x（仅打包需要）|

## 🔧 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | [Tauri 2](https://v2.tauri.app) |
| 前端框架 | [React 18](https://react.dev) |
| 语言 | [TypeScript 5](https://www.typescriptlang.org) |
| 构建工具 | [Vite 5](https://vitejs.dev) |
| Markdown 解析 | [markdown-it](https://github.com/markdown-it/markdown-it) |
| HTML 安全 | [DOMPurify](https://github.com/cure53/DOMPurify) |
| 代码高亮 | [highlight.js](https://highlightjs.org) |
| Rust 后端 | [Tauri API](https://v2.tauri.app/reference) + 原生文件系统 |

## 📦 项目结构

```
MarkLume/
├─ src/                  # 前端源码 (React + TypeScript)
│  ├─ components/        # UI 组件
│  │  ├─ AppShell.tsx    # 应用主骨架
│  │  ├─ Toolbar.tsx     # 顶部工具栏
│  │  ├─ Sidebar.tsx     # 左侧文件树/最近文件
│  │  ├─ MarkdownViewer.tsx  # Markdown 渲染区
│  │  ├─ OutlinePanel.tsx    # 右侧大纲面板
│  │  ├─ SearchBar.tsx   # 当前文件搜索
│  │  ├─ FolderSearchPanel.tsx  # 文件夹搜索
│  │  ├─ SettingsPanel.tsx     # 设置面板
│  │  ├─ ContextMenu.tsx  # 右键菜单
│  │  └─ ErrorBoundary.tsx  # 错误边界
│  ├─ services/          # 业务逻辑
│  ├─ stores/            # 状态管理
│  ├─ styles/            # 样式
│  └─ types/             # TypeScript 类型
├─ src-tauri/            # Rust 后端源码
│  └─ src/
│     ├─ commands.rs     # Tauri 命令注册
│     ├─ file_system.rs  # 文件系统操作
│     └─ lib.rs          # 应用入口
├─ .github/              # GitHub 配置
│  └─ ISSUE_TEMPLATE/    # Issue 模板
├─ docs/                 # 开发文档
├─ logo-concepts/        # Logo 设计稿
├─ package.json
└─ tauri.conf.json
```

## 🗺️ 路线图

### v0.1.x — MVP 基础阅读器 ✅
- [x] 基础 Markdown 渲染
- [x] 文件/文件夹打开
- [x] 文件夹树形浏览
- [x] 大纲导航
- [x] 暗色/亮色主题
- [x] 文件内搜索
- [x] 文件夹全文搜索
- [x] 最近文件
- [x] 文件关联（双击打开）
- [x] Windows 安装包 (NSIS)

### v0.2.x — 阅读体验增强 ✅
- [x] 图片相对路径显示优化
- [x] 代码块复制按钮
- [x] 沉浸式阅读模式
- [x] 记住每个文件的阅读位置
- [x] 拖拽文件到窗口打开
- [x] 行号显示

### v0.3.x — 进阶功能 ✅
- [x] 字体族自定义
- [x] 自定义 CSS 主题（羊皮纸/Solarized/Nord/Dracula）
- [x] 收藏书签（⭐ 收藏/取消，侧边栏管理）
- [x] 自动检测文件变更刷新
- [x] 右键菜单重构（文字复制 / 收藏取消）
- [x] 全局禁用默认右键菜单

### v0.4.x — 待定
- [ ] 多标签页支持

### v1.0.0 — 稳定版
- [ ] 性能优化
- [ ] macOS/Linux 支持
- [ ] 国际化 (i18n)
- [ ] 自动更新

## 🤝 贡献

欢迎贡献代码、报告 Bug 或提出功能建议！

- [贡献指南](CONTRIBUTING.md)
- [报告 Bug](https://github.com/cheng-corex/MarkLume/issues/new?template=bug-report.md)
- [功能建议](https://github.com/cheng-corex/MarkLume/issues/new?template=feature-request.md)

## 📄 许可

本项目基于 [MIT 许可证](LICENSE) 开源。

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/cheng-corex">cheng-corex</a></sub>
</div>