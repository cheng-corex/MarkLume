# 贡献指南

感谢你考虑为 MarkLume 贡献代码！本文档描述了参与项目开发的相关流程和规范。

## 行为准则

请保持友善、尊重和建设性的沟通。任何形式的骚扰或不当行为都是不被允许的。

## 如何贡献

### 报告 Bug

1. 使用 [GitHub Issues](https://github.com/cheng-corex/MarkLume/issues) 提交
2. 使用提供的 Bug 报告模板
3. 清晰描述复现步骤、预期行为和实际行为
4. 附上截图、日志或错误信息

### 功能建议

1. 使用功能建议模板提交 Issue
2. 说明使用场景和预期效果
3. 如果可能，提供设计方案或参考示例

### 提交代码

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature`
3. 遵循代码规范进行修改
4. 确保代码编译通过：`npm run build`
5. 提交代码：`git commit -m "feat: 简明的提交信息"`
6. 推送到你的仓库：`git push origin feat/your-feature`
7. 提交 Pull Request

## 开发环境设置

```bash
# 克隆项目
git clone https://github.com/cheng-corex/MarkLume.git
cd MarkLume

# 安装前端依赖
npm install

# 启动开发模式（前端热更新）
npm run dev

# 启动 Tauri 桌面应用（含前端热更新）
npm run tauri dev
```

### 环境要求

- Node.js 18+
- Rust 1.70+
- Windows 10/11 (目标平台)

## 代码规范

- TypeScript 代码遵循项目中 tsconfig.json 的配置
- React 组件使用函数式组件 + Hooks
- Rust 代码遵循 `cargo fmt` 格式化标准
- CSS 变量遵循 `--xxx-yyy` 命名风格

## 提交信息格式

```
<type>: <简短描述>

<可选详细描述>
```

类型参考：

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `style` | 样式/UI 调整 |
| `refactor` | 代码重构 |
| `docs` | 文档更新 |
| `chore` | 构建/工具链变更 |

## Pull Request 流程

1. 确保 PR 描述清晰说明变更内容和动机
2. 关联相关 Issue（如 `Closes #123`）
3. 等待 Code Review
4. 合并后分支会被删除

## 项目结构

```
MarkLume/
├─ src/              # 前端源码 (React + TypeScript)
│  ├─ components/    # UI 组件
│  ├─ services/      # 业务逻辑服务
│  ├─ stores/        # 状态管理
│  ├─ styles/        # 样式文件
│  └─ types/         # TypeScript 类型
├─ src-tauri/        # Rust 后端源码
│  └─ src/           # Rust 命令和文件系统操作
└─ docs/             # 开发文档
```

如有任何问题，欢迎提交 Issue 或 Discussions。
