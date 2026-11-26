const { normalizeConfig } = require('./config')

const REQUEST_TIMEOUT_MS = 90_000
const MAX_ERROR_BODY = 4_096

function endpointFor(baseURL) {
  return `${baseURL}/chat/completions`
}

function redactSecrets(text, apiKey = '') {
  let safe = String(text || '')
  if (apiKey) safe = safe.split(apiKey).join('[已隐藏密钥]')
  return safe.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [已隐藏密钥]')
}

function requestId() {
  return `zml_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function validatePayload(payload) {
  if (!payload || !Array.isArray(payload.messages) || payload.messages.length === 0 || payload.messages.length > 200) {
    throw new Error('消息列表必须包含 1 到 200 条消息')
  }
  for (const message of payload.messages) {
    if (!message || !['system', 'user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      throw new Error('消息格式不正确')
    }
    if (message.content.length > 200_000) throw new Error('单条消息长度超出限制')
  }
}

async function proxyChatCompletion(apiConfig, payload, options = {}) {
  const config = normalizeConfig(apiConfig)
  if (!config.baseURL || !config.model) throw new Error('请先在设置中填写 Base URL 和 Model')
  validatePayload(payload)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(new Error('请求超过 90 秒，已自动取消')), REQUEST_TIMEOUT_MS)
  const onAbort = () => controller.abort(options.signal?.reason)
  options.signal?.addEventListener('abort', onAbort, { once: true })

  try {
    let response
    try {
      response = await (options.fetchImpl || fetch)(endpointFor(config.baseURL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Z-Eryuan/2.0',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: config.model,
          messages: payload.messages,
          temperature: config.temperature,
          stream: false
        }),
        signal: controller.signal
      })
    } catch (error) {
      if (controller.signal.aborted) throw new Error(options.signal?.aborted ? '已停止生成' : controller.signal.reason?.message || '请求已取消')
      throw new Error(`无法连接 API：${redactSecrets(error.message, config.apiKey)}。请检查地址、网络和本地服务状态`)
    }

    const responseText = await response.text()
    if (!response.ok) {
      let detail = responseText.slice(0, MAX_ERROR_BODY)
      try {
        const parsed = JSON.parse(responseText)
        detail = parsed.error?.message || parsed.message || detail
      } catch { /* 保留原始文本 */ }
      const hints = {
        400: '请求参数或模型名称可能不正确',
        401: 'API Key 无效或已过期',
        403: '端点拒绝了访问，请检查权限',
        404: '接口路径不存在，Base URL 通常应填写到 /v1',
        429: '请求过于频繁或额度已用尽',
        500: '云端服务内部错误',
        502: '网关无法连接上游模型',
        503: '模型服务暂时不可用'
      }
      throw new Error(`API 返回 HTTP ${response.status}${hints[response.status] ? `（${hints[response.status]}）` : ''}：${redactSecrets(detail, config.apiKey)}`)
    }

    let data
    try { data = JSON.parse(responseText) } catch { throw new Error('API 返回的不是有效 JSON，请确认这是 OpenAI 兼容端点') }
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') throw new Error('API 响应缺少 choices[0].message.content')

    return {
      id: data.id || requestId(),
      content,
      model: data.model || config.model,
      usage: data.usage || null,
      finishReason: data.choices?.[0]?.finish_reason || null
    }
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', onAbort)
  }
}

module.exports = { proxyChatCompletion, validatePayload, endpointFor, redactSecrets }
