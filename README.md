# Z 梧墨朗 · 你的云端 API 套壳

你自己的云端 API 桌面套壳应用。接入自有算力端点，对话数据在本机，模型你自选。

## 特性

- **桌面应用体验**：Electron 壳，可打包 `.exe` 双击运行，无浏览器地址栏
- **降级运行**：Electron 环境不可用时，直接双击 `src/renderer/index.html` 用浏览器打开
- **自有云端 API**：配置你自己的 Base URL、API Key、Model，接入自有算力
- **配置本地持久化**：API 配置保存在本地 `config.json` / `localStorage`，**不上传、不写入代码**
- **DID 身份**：本机生成 `did:zml:*` 身份标识
- **不做回测、不做金融建议、不主动联网**：仅调用你配置的 API 端点

## 项目结构

```
z-wuminglang/
├── README.md
├── LICENSE
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
│       ├── css/style.css     # 深色主题
│       ├── js/app.js         # 应用入口（路由、状态）
│       ├── js/chat.js        # 聊天逻辑
│       ├── js/settings.js    # 设置逻辑
│       └── js/storage.js     # 本地存储封装
└── tests/
    └── smoke.test.js
```

## 快速开始

### 1. 直接运行（无需安装依赖）

双击 `src/renderer/index.html`，用默认浏览器打开即可使用。

### 2. Electron 运行

```bash
npm install
npm start
```

### 3. 打包 Windows `.exe`

```bash
npm run pack
```

输出到 `release/` 目录，安装后会在桌面创建 `Z 梧墨朗` 快捷方式。

## 配置你的云端 API

打开应用后，点击左下角 **⚙ 设置**，填写：

| 字段 | 示例 | 说明 |
|------|------|------|
| Base URL | `https://api.yourdomain.com/v1` | 你的云端 API 端点 |
| API Key | `sk-...` | 你的密钥（可留空） |
| Model | `deepseek-chat` / `llama-3` | 你云端提供的模型名称 |

保存后切回 **对话** 页即可提问。

## 不做的事

- ❌ 不做股票回测
- ❌ 不做金融投资建议
- ❌ 不做行情分析
- ❌ 不主动联网，仅调用你配置的 API 端点
- ❌ 不上传你的 API Key 或对话内容

## 许可证

[MIT](LICENSE)
