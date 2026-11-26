/**
 * 聊天逻辑
 */

function genDid() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return 'did:zml:' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

function appendMsg(role, text) {
  const wrap = document.getElementById('messages')
  const div = document.createElement('div')
  div.className = 'msg ' + (role === 'user' ? 'user' : 'zml')
  div.textContent = text

  const meta = document.createElement('div')
  meta.className = 'msg meta'
  meta.textContent = role === 'user'
    ? '用户 · ' + new Date().toLocaleTimeString()
    : 'Z 梧墨朗 · ' + new Date().toLocaleTimeString()

  wrap.appendChild(div)
  wrap.appendChild(meta)
  wrap.scrollTop = wrap.scrollHeight
}

function showToast(msg) {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2500)
}

async function sendMessage() {
  const input = document.getElementById('chatInput')
  const text = input.value.trim()
  if (!text) return

  input.value = ''
  const btn = document.getElementById('btnSend')
  btn.disabled = true

  appendMsg('user', text)

  try {
    const config = await window.zmlAPI.getApiConfig()
    if (!config.baseURL || !config.model) {
      appendMsg('zml', '错误：请先在「设置」里填写 Base URL 和 Model')
      return
    }

    const res = await window.zmlAPI.chatCompletion({
      messages: [{ role: 'user', content: text }],
      temperature: 0.7
    })

    const reply = res.choices?.[0]?.message?.content || '无回复'
    appendMsg('zml', reply)
  } catch (e) {
    appendMsg('zml', '错误：' + e.message)
  } finally {
    btn.disabled = false
  }
}

module.exports = { genDid, appendMsg, showToast, sendMessage }
