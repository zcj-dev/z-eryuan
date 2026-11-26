/**
 * 云端 API 代理
 * 将对话请求转发到用户配置的自有算力端点（OpenAI 兼容格式）
 */

async function proxyChatCompletion(apiConfig, payload) {
  const { baseURL, apiKey, model } = apiConfig

  if (!baseURL || !model) {
    throw new Error('请先在设置里填写 Base URL 和 Model')
  }

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      model,
      messages: payload.messages,
      temperature: payload.temperature ?? 0.7,
      stream: false
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }

  return res.json()
}

module.exports = { proxyChatCompletion }
