/**
 * 本地存储封装（localStorage）
 */

const STORAGE_KEYS = {
  API_CONFIG: 'zml_api_config'
}

function loadApiConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_CONFIG)
    return raw ? JSON.parse(raw) : { baseURL: '', apiKey: '', model: '' }
  } catch (e) {
    return { baseURL: '', apiKey: '', model: '' }
  }
}

function saveApiConfig(config) {
  localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config))
}

module.exports = { STORAGE_KEYS, loadApiConfig, saveApiConfig }
