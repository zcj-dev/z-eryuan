/**
 * Z 二次元 · 对话逻辑
 */

const zmlChat = (() => {
  async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    const btn = document.getElementById('btnSend');
    btn.disabled = true;

    zmlCore.appendMsg('user', text);

    try {
      const config = window._currentConfig || JSON.parse(localStorage.getItem('zml_api_config') || '{}');
      if (!config.baseURL || !config.model) {
        zmlCore.appendMsg('zml', '错误：请先在「设置」里填写 Base URL 和 Model');
        return;
      }

      // 优先用 Electron IPC（桌面应用），降级为直接 fetch（浏览器直开）
      let res;
      if (window.zmlAPI && typeof window.zmlAPI.chatCompletion === 'function') {
        res = await window.zmlAPI.chatCompletion({
          messages: [{ role: 'user', content: text }],
          temperature: 0.7
        });
      } else {
        res = await fetch(config.baseURL + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { 'Authorization': 'Bearer ' + config.apiKey } : {})
          },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: text }],
            temperature: 0.7,
            stream: false
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error('API ' + res.status + ': ' + errText);
        }
        res = await res.json();
      }

      const reply = res.choices?.[0]?.message?.content || '无回复';
      zmlCore.appendMsg('zml', reply);
    } catch (e) {
      zmlCore.appendMsg('zml', '错误：' + e.message);
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }

  function initInput() {
    const input = document.getElementById('chatInput');
    const btn = document.getElementById('btnSend');
    const clear = document.getElementById('btnClearChat');

    if (!input || !btn) return;

    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    btn.addEventListener('click', sendMessage);

    if (clear) {
      clear.addEventListener('click', function () {
        const wrap = document.getElementById('messages');
        if (wrap) wrap.innerHTML = '';
        const empty = document.getElementById('emptyState');
        if (empty) empty.style.display = 'flex';
      });
    }
  }

  return { sendMessage, initInput };
})();
