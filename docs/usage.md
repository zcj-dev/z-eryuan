# 使用指南

## 启动应用

### 浏览器直开（无需安装依赖）

双击 `src/renderer/index.html`，使用任意现代浏览器打开即可。

### Electron 桌面应用

```powershell
npm install
npm start
```

## 配置云端 API

1. 点击左侧边栏底部的 **⚙ 设置**
2. 填写以下字段：
   - **Base URL**：你的云端 API 端点，例如 `https://api.yourdomain.com/v1`
   - **API Key**：鉴权密钥（可留空）
   - **Model**：你使用的模型名称，例如 `deepseek-chat`
3. 点击 **保存配置**
4. 可选：点击 **测试连接** 验证 API 是否可达

## 开始对话

1. 切回 **对话** 页面
2. 在底部输入框输入问题
3. 按 **Enter** 发送（按住 **Shift + Enter** 换行）
4. 查看右侧（或左侧）的 AI 回复

## 清空对话

点击页面顶部的 **🗑️** 按钮可清空当前对话历史。

## 注意事项

- 所有配置仅存在本机，不会上传到任何服务器
- 仅支持 OpenAI 兼容格式的 `/v1/chat/completions` 端点
- 不做股票回测、不做金融投资建议
