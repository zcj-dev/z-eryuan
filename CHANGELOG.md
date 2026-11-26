# 变更日志

## [1.0.0] - 2026-11-26

### 新增
- 基于 Electron 的桌面套壳应用
- 云端 API 配置（Base URL / API Key / Model）
- 对话气泡界面（用户 / Z 二次元）
- Markdown 简单渲染（代码块、行内代码、换行、链接）
- 本地配置持久化（localStorage / config.json）
- DID 身份生成（`did:zml:*`）
- 快速预设：自定义 / LiteLLM 本地 / Ollama 本地
- API 连接测试
- 降级运行：无 Electron 环境时直接双击 `index.html` 用浏览器打开
- 打包配置：Windows NSIS 安装包，桌面快捷方式
- 冒烟测试（`tests/smoke.test.js`）

### 不做的事
- 不做股票回测
- 不做金融投资建议
- 不做行情分析
- 不主动联网（仅调用你配置的 API 端点）
- 不上传 API Key 或对话内容
