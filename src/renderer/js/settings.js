/**
 * 设置逻辑
 */

function updateApiStatus() {
  const el = document.getElementById('apiStatus')
  const txt = document.getElementById('apiStatusText')
  const config = window._currentConfig || { baseURL: '', apiKey: '', model: '' }

  if (config.baseURL && config.model) {
    el.querySelector('.dot').className = 'dot ok'
    txt.textContent = 'API 已就绪：' + config.model + ' @ ' + config.baseURL
  } else {
    el.querySelector('.dot').className = 'dot'
    txt.textContent = '未配置 API'
  }
}

function setPreset(type) {
  const b = document.getElementById('inpBaseURL')
  const m = document.getElementById('inpModel')

  if (type === 'litellm') {
    b.value = 'http://localhost:4000/v1'
    m.value = ''
  } else if (type === 'ollama') {
    b.value = 'http://localhost:11434/v1'
    m.value = 'gemma4:12b'
  } else {
    b.value = ''
    m.value = ''
  }

  document.querySelectorAll('.option').forEach(o => {
    const inp = o.querySelector('input')
    const selected = (type === 'litellm' && inp.value === 'litellm') ||
      (type === 'ollama' && inp.value === 'ollama') ||
      (type === 'custom' && inp.value === 'custom')
    o.classList.toggle('selected', selected)
  })
}

async function saveApiConfig() {
  const config = {
    baseURL: document.getElementById('inpBaseURL').value.trim(),
    apiKey: document.getElementById('inpApiKey').value.trim(),
    model: document.getElementById('inpModel').value.trim()
  }

  if (!config.baseURL || !config.model) {
    showToast('Base URL 和 Model 都不能为空')
    return
  }

  await window.zmlAPI.setApiConfig(config)
  localStorage.setItem('zml_api_config', JSON.stringify(config))
  window._currentConfig = config
  updateApiStatus()
  document.getElementById('apiResult').textContent = '配置已保存到本地'
  showToast('API 配置已保存')
}

async function testApiConnection() {
  const config = window._currentConfig || JSON.parse(localStorage.getItem('zml_api_config') || '{}')
  if (!config.baseURL || !config.model) {
    showToast('请先填写 API 配置')
    return
  }

  try {
    const res = await window.zmlAPI.chatCompletion({
      messages: [{ role: 'user', content: 'ping' }],
      temperature: 0.1
    })
    showToast('API 连接正常：' + (res.choices?.[0]?.message?.content?.slice(0, 30) || 'OK'))
  } catch (e) {
    showToast('API 连接失败：' + e.message)
  }
}

module.exports = { updateApiStatus, setPreset, saveApiConfig, testApiConnection }
