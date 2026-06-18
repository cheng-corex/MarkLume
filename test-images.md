# MarkLume 图片测试

## 1. 相对路径图片（推荐方式）

使用 `./` 开头的相对路径：

![Logo](./src-tauri/icons/32x32.png)

## 2. 无前缀路径

直接写文件路径（不带 `./`）：

![Logo](src-tauri/icons/icon.png)

## 3. 在线图片（外链）

![Markdown](https://markdown-it.github.io/assets/markdown-it-logo.svg)


## 4. Markdown 渲染测试

### 代码块
```javascript
function hello() {
  console.log("Hello MarkLume!");
}
```

### 列表
- 功能一：打开文件
- 功能二：文件夹浏览
- 功能三：沉浸式阅读

### 表格
| 功能 | 状态 |
|------|------|
| 图片显示 | 测试中 |
| 代码高亮 | ✅ |
| 行号 | ✅ |
| 复制按钮 | ✅ |

### 引用
> MarkLume —— 轻量级本地 Markdown 阅读器

如果图片能正常显示，说明修复成功 🎉
