# 构建与发布

## 构建命令

```bash
# 开发模式
pnpm tauri dev

# 生产构建
pnpm tauri build
```

## 应用配置

配置文件：`src-tauri/tauri.conf.json`

需要配置：
- 应用名称（identifier）
- 应用显示名称
- 版本号
- 应用图标
- Windows 配置（目标平台设置）

## Windows 打包

Tauri 2 默认使用 WiX 或 NSIS 生成 Windows 安装包。

### 打包要求

- 生成 `.msi` 或 `.exe` 安装包
- 支持开始菜单快捷方式
- 支持桌面快捷方式
- 支持文件类型关联（可选）

### 图标要求

- 至少需要 `32x32`、`128x128`、`256x256` 尺寸
- 格式：`.ico`（Windows）

## 发布流程

1. 更新版本号（`tauri.conf.json` 中的 `version`）
2. 更新文档中的版本信息
3. 运行 `pnpm tauri build`
4. 获取安装包（在 `src-tauri/target/release/bundle/` 目录）
5. 测试安装包
6. 发布

## 安装验证

1. 双击安装包
2. 确认安装向导正常
3. 确认开始菜单有快捷方式
4. 确认应用正常启动
5. 确认能正常打开 Markdown 文件
6. 确认卸载正常