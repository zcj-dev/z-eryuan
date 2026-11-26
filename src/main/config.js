const fs = require('node:fs')
const path = require('node:path')

const DEFAULTS = Object.freeze({
  baseURL: '',
  apiKey: '',
  model: '',
  temperature: 0.7,
  systemPrompt: '你是 Z 二次元，一个直接、清晰、乐于助人的 AI 助手。'
})

const MAX_STRING_LENGTH = 16_384
const MAX_SYSTEM_PROMPT_LENGTH = 32_768

function normalizeConfig(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('配置必须是对象')
  }

  const config = {
    baseURL: String(input.baseURL ?? '').trim().replace(/\/+$/, ''),
    apiKey: String(input.apiKey ?? '').trim(),
    model: String(input.model ?? '').trim(),
    temperature: Number(input.temperature ?? DEFAULTS.temperature),
    systemPrompt: String(input.systemPrompt ?? DEFAULTS.systemPrompt).trim()
  }

  for (const key of ['baseURL', 'apiKey', 'model']) {
    if (config[key].length > MAX_STRING_LENGTH) throw new Error(`${key} 长度超出限制`)
  }
  if (config.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) throw new Error('系统提示词长度超出限制')
  if (!Number.isFinite(config.temperature) || config.temperature < 0 || config.temperature > 2) {
    throw new Error('Temperature 必须在 0 到 2 之间')
  }

  if (config.baseURL) {
    let url
    try {
      url = new URL(config.baseURL)
    } catch {
      throw new Error('Base URL 不是合法 URL')
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error('Base URL 仅支持不带凭证、查询参数的 HTTP(S) 地址')
    }
    if (url.pathname.endsWith('/chat/completions')) {
      throw new Error('Base URL 请填写到 /v1，不要包含 /chat/completions')
    }
  }

  return config
}

function publicConfig(config) {
  const normalized = normalizeConfig(config)
  return { ...normalized, hasApiKey: Boolean(normalized.apiKey), apiKey: undefined }
}

function createConfigStore(filePath) {
  function load() {
    if (!fs.existsSync(filePath)) return { ...DEFAULTS }
    try {
      return normalizeConfig({ ...DEFAULTS, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) })
    } catch (error) {
      const backup = `${filePath}.invalid-${Date.now()}`
      try { fs.copyFileSync(filePath, backup) } catch { /* 保留原始读取错误 */ }
      throw new Error(`配置文件损坏，已尝试备份到 ${path.basename(backup)}：${error.message}`)
    }
  }

  function save(input) {
    const config = normalizeConfig(input)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    const temporary = `${filePath}.${process.pid}.tmp`
    fs.writeFileSync(temporary, `${JSON.stringify(config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    fs.renameSync(temporary, filePath)
    return config
  }

  return { filePath, load, save }
}

module.exports = { DEFAULTS, normalizeConfig, publicConfig, createConfigStore }
