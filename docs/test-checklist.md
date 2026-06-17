# 测试清单

## 基础测试

- [ ] 空文件
- [ ] 普通 Markdown 文件
- [ ] 包含中文的 Markdown 文件
- [ ] 包含表格的 Markdown 文件
- [ ] 包含代码块的 Markdown 文件
- [ ] 包含本地图片的 Markdown 文件
- [ ] 包含外部链接的 Markdown 文件
- [ ] 包含 HTML 的 Markdown 文件
- [ ] 文件路径包含中文
- [ ] 文件路径包含空格
- [ ] 文件不存在
- [ ] 文件权限不足
- [ ] 大文件
- [ ] 重启后配置恢复
- [ ] 打包后安装运行

## 安全测试

- [ ] Markdown 中包含 `<script>`
- [ ] Markdown 中包含危险事件属性（如 `onclick`）
- [ ] Markdown 中包含 `iframe`
- [ ] Markdown 中包含外部链接
- [ ] Markdown 中包含本地路径图片
- [ ] 确认未清洗 HTML 不会直接进入 DOM

## 性能测试

- [ ] 1MB Markdown 文件打开速度
- [ ] 5MB Markdown 文件打开速度
- [ ] 10MB Markdown 文件打开速度
- [ ] 大量标题的大纲生成速度
- [ ] 大目录扫描速度
- [ ] 搜索响应速度