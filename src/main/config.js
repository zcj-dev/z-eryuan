const fs = require('node:fs')
const path = require('node:path')

const CONFIG_PATH = path.join(__dirname, '../../config.json')

const DEFAULTS = {
  baseURL: 'http://localhost:4000/v1',
  apiKey: '',
  model: ''
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
      const parsed = JSON.parse(raw)
      return { ...DEFAULTS, ...parsed }
    }
  } catch (e) {
    return { ...DEFAULTS }
  }
  return { ...DEFAULTS }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (e) {
    // 静默失败，配置仅在内存中生效
  }
}

module.exports = { loadConfig, saveConfig, DEFAULTS }
