# 实施计划

## Tauri 后端设计

### Commands

```rust
read_markdown_file(path: String) -> Result<FileContent, String>
list_markdown_files(folder: String) -> Result<Vec<FileEntry>, String>
read_app_settings() -> Result<AppSettings, String>
write_app_settings(settings: AppSettings) -> Result<(), String>
```

### 安全约束

1. 只允许读取用户主动选择的文件
2. 只允许读取 `.md`、`.markdown`、`.txt`
3. 大文件限制 20MB
4. 清晰错误提示
5. 相对图片路径基于 Markdown 文件所在目录解析

## 前端模块职责

### MarkdownViewer
- 接收 Markdown 原文
- 调用 markdownRenderer 转 HTML
- DOMPurify 清洗
- 渲染阅读内容
- 代码高亮
- 图片路径处理
- 链接点击处理

### Toolbar
- 打开文件
- 打开文件夹
- 切换主题
- 调整字号
- 打开搜索
- 显示当前文件名

### Sidebar
- 显示最近文件
- 显示文件树
- 显示设置入口
- 支持收起/展开

### OutlinePanel
- 提取 Markdown 标题
- 展示标题层级
- 点击跳转
- 滚动高亮

### SearchPanel
- 当前文件搜索
- 文件夹搜索
- 展示结果
- 点击跳转

## 核心数据结构

### OpenedFile
```ts
export type OpenedFile = {
  path: string;
  name: string;
  content: string;
  size: number;
  modifiedAt: number;
};
```

### RecentFile
```ts
export type RecentFile = {
  path: string;
  name: string;
  openedAt: number;
};
```

### AppSettings
```ts
export type AppSettings = {
  theme: "light" | "dark" | "system";
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  contentWidth: "narrow" | "normal" | "wide";
  sidebarVisible: boolean;
  outlineVisible: boolean;
  lastOpenedFile?: string;
  lastOpenedFolder?: string;
  recentFiles: RecentFile[];
};
```

### OutlineItem
```ts
export type OutlineItem = {
  id: string;
  level: number;
  text: string;
  children?: OutlineItem[];
};
```

### SearchResult
```ts
export type SearchResult = {
  filePath: string;
  fileName: string;
  heading?: string;
  excerpt: string;
  line?: number;
};
```