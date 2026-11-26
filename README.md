# Z 梧墨朗 (Z WuMingLang)

你自己的云端 API 套壳桌面应用。接入自有算力端点，对话数据在本机，模型你自选。

[![GitHub release](https://img.shields.io/github/v/release/zcj-dev/z-wuminglang)](https://github.com/zcj-dev/z-wuminglang/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/electron-31.x-4F8CFF.svg)](https://www.electronjs.org/)

---

## 项目简介

**Z 梧墨朗** 是一个极简的云端 API 桌面套壳应用，基于 Electron 构建。

它不绑定任何官方模型，也不主动联网。你只需在「设置」里填入你自己的云端 API 端点（Base URL）、API Key 和模型名称，即可把它变成**你私有的对话客户端**。所有配置仅保存在本机，不会上传到任何服务器。

适合场景：
- 接入自建的 LiteLLM / Ollama / vLLM / 其他 OpenAI 兼容端点
- 不想把对话数据发给第三方 AI 服务商
- 需要一个桌面级聊天窗口，而不想打开浏览器标签页

---

## 特性

| 特性 | 说明 |
|------|------|
| 🖥️ 桌面应用 | Electron 壳，打包后双击 `.exe` 运行，无浏览器地址栏 |
| 🌐 降级运行 | 无 Electron 环境时，直接双击 `src/renderer/index.html` 用浏览器打开 |
| ☁️ 自有云端 API | 支持任意 OpenAI 兼容格式的 `/v1/chat/completions` 端点 |
| 🔒 本地存储 | API 配置仅保存在本机 `localStorage` / `config.json`，不上传 |
| 🆔 DID 身份 | 本机生成 `did:zml:*` 身份标识 |
| 💬 现代界面 | 气泡对话、Markdown 渲染、代码块高亮、深色主题 |
| ⚙️ 快速预设 | 内置 LiteLLM / Ollama 本地预设，一键填充 |

---

## 快速开始

### 方式一：直接运行（无需安装依赖）

双击以下文件，用默认浏览器打开即可：

```
C:\Users\chan\Desktop\z-wuminglang\src\renderer\index.html
```

### 方式二：Electron 桌面应用

```powershell
# 进入项目目录
cd C:\Users\chan\Desktop\z-wuminglang

# 安装依赖
npm install

# 启动开发模式
npm start
```

### 方式三：打包 Windows 安装包

```powershell
cd C:\Users\chan\Desktop\z-wuminglang
npm run pack
```

输出到 `release/` 目录，安装后桌面会创建 `Z 梧墨朗` 快捷方式。

---

## 配置你的云端 API

打开应用后，点左下角 **⚙ 设置**，填写：

| 字段 | 必填 | 示例 | 说明 |
|------|------|------|------|
| Base URL | ✅ | `https://api.yourdomain.com/v1` | 你的云端 API 端点，需支持 OpenAI 兼容格式 |
| API Key | ❌ | `sk-...` | 可留空，若端点不需要鉴权 |
| Model | ✅ | `deepseek-chat` / `llama-3` | 你云端提供的模型名称 |

保存后切回 **对话** 页即可提问。

### 快速预设

设置页提供三个预设：
- **自定义云端 API**：手动填写所有字段
- **LiteLLM 本地**：自动填充 `http://localhost:4000/v1`
- **Ollama 本地**：自动填充 `http://localhost:11434/v1`，模型填 `gemma4:12b`

---

## 项目结构

```
z-wuminglang/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
├── .gitignore
├── package.json
├── electron-builder.json
├── src/
│   ├── main/
│   │   ├── index.js    # Electron 主进程（窗口、IPC、API 配置）
│   │   ├── api.js      # 云端 API 代理（OpenAI 兼容格式）
│   │   └── config.js   # 配置读写（config.json）
│   ├── preload/
│   │   └── index.js    # 预加载脚本（window.zmlAPI bridge）
│   └── renderer/
│       ├── index.html        # 主页面
│       ├── css/style.css     # 深色主题样式
│       ├── js/zml-core.js    # 核心模块（DID、消息气泡、Toast、Markdown）
│       ├── js/zml-settings.js# 设置逻辑（配置保存、连接测试）
│       ├── js/zml-chat.js    # 对话逻辑（发送消息、输入框）
│       └── js/zml-app.js     # 应用入口（路由切换、状态初始化）
├── tests/
│   └── smoke.test.js         # 冒烟测试
├── docs/
│   ├── usage.md              # 使用指南
│   └── deploy.md             # 部署指南
└── .github/
    ├── ISSUE_TEMPLATE/
    │   └── bug_report.md
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
        └── ci.yml
```

---

## 开发

```powershell
# 安装依赖
npm install

# 运行冒烟测试
npm test

# 启动应用
npm start

# 打包
npm run pack
```

## 贡献

欢迎提交 Issue 和 Pull Request。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 安全

如果你发现安全问题，请参阅 [SECURITY.md](SECURITY.md)。

> ⚠️ **重要**：你的 API Key 和对话内容仅存在本机，本项目不会主动上传任何数据。请不要在公开仓库中提交包含真实密钥的 `config.json`。

## 许可证

[MIT](LICENSE)

---

**不做的事**：不做股票回测、不做金融投资建议、不做行情分析、不主动联网（仅调用你配置的 API 端点）。
