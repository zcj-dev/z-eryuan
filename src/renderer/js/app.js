/**
 * 应用入口：路由切换、初始化、全局事件绑定
 */

import { genDid, appendMsg, showToast, sendMessage } from './chat.js'
import { updateApiStatus, setPreset, saveApiConfig, testApiConnection } from './settings.js'
import { loadApiConfig } from './storage.js'

window.app = {}
window.zmlAPI = window.zmlAPI || {}

document.addEventListener('DOMContentLoaded', () => {
  // DID 身份
  const did = genDid()
  document.getElementById('didValue').textContent = did

  // 载入 API 配置
  const config = loadApiConfig()
  window._currentConfig = config
  document.getElementById('inpBaseURL').value = config.baseURL || ''
  document.getElementById('inpApiKey').value = config.apiKey || ''
  document.getElementById('inpModel').value = config.model || ''
  updateApiStatus()

  // 视图切换
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      const view = this.getAttribute('data-view')
      switchView(view)
    })
  })

  // 聊天发送
  document.getElementById('btnSend').addEventListener('click', sendMessage)
  document.getElementById('chatInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage()
  })
})

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  document.getElementById('view-' + name).classList.add('active')
  event.currentTarget.classList.add('active')
  updateApiStatus()
}

window.app.switchView = switchView
window.app.setPreset = setPreset
window.app.saveApiConfig = saveApiConfig
window.app.testApiConnection = testApiConnection
