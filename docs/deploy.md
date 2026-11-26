# 部署指南

## 打包 Windows 安装包

```powershell
cd C:\Users\chan\Desktop\z-eryuan
npm run pack
```

输出文件：`release/Z 二次元-1.0.0-setup.exe`

安装后桌面会创建 `Z 二次元` 快捷方式。

## 打包目录版（免安装）

```powershell
npm run pack:dir
```

输出到 `release/win-unpacked/`，可直接运行 `Z 二次元.exe`。

## 配置文件说明

- Electron 运行时：配置写入 `config.json`（项目根目录）
- 浏览器直开时：配置写入浏览器 `localStorage`
- 两者互不共享，分别独立生效

## 生产环境建议

- 不要将包含真实 API Key 的 `config.json` 提交到版本控制
- `.gitignore` 已屏蔽 `config.json` 和 `.env`
