# 图片测试 2 - 各种路径方式

## 方式1: 相对路径 (./)

![Logo 32px](./src-tauri/icons/32x32.png)

## 方式2: 无前缀路径

![Icon](src-tauri/icons/icon.png)

## 方式3: 带空格路径

目前无

## 方式4: 图片在子目录

先在 `src-tauri/icons/` 下放一个测试图片

## 方式5: 多级返回 (../)

![App Icon](../mdViewer/src-tauri/icons/128x128.png)

## 方式6: 完整路径 (Tauri file 协议)

正常不展示

## 方式7: Base64 data URL

直接使用 base64:
![绿点](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==)

## 方式8: 外链图片

![External](https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png)

## 测试结论

| 路径方式 | 结果 |
|---------|------|
| `./xxx` | 待验证 |
| `xxx` | 待验证 |
| `data:base64,...` | 应该正常 |
| `https://...` | 依赖网络 |

> 如果能正常看到 Logo 图片，说明 `data-local-src` + DOMPurify 配置生效了 🎉
