/**
 * Z 二次元 · 对话逻辑（发送、停止、重试、清空、导出）
 */

const zmlChat = (() => {
  let currentRequestId = null;
  let isStreaming = false;

  function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    const btn = document.getElementById('btnSend');
    const stopBtn = document.getElementById('btnStop');
    btn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    isStreaming = true;
    currentRequestId = 'zml_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    const sessId = window._activeSessionId || zmlState.getActiveId();
    if (!sessId) {
      zmlCore.appendMsg('zml', '错误：没有可用的会话，请新建一个会话后再发送');
      btn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
      isStreaming = false;
      return;
    }

    zmlCore.appendMsg('user', text);
    zmlState.addMessageToSession(sessId, { role: 'user', content: text, ts: Date.now() });
    zmlCore.appendStreamingMsg('zml', currentRequestId);

    const config = window._currentConfig || zmlState.loadApiConfig();
    if (!config.baseURL || !config.model) {
      zmlCore.replaceMsg(currentRequestId, '错误：请先在「设置」里填写 Base URL 和 Model');
      zmlState.replaceLastMessage(sessId, { role: 'assistant', content: '错误：未配置 API', ts: Date.now() });
      btn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
      isStreaming = false;
      currentRequestId = null;
      return;
    }

    (async () => {
      try {
        const res = await window.desktop.sendMessage({
          requestId: currentRequestId,
          messages: [{ role: 'user', content: text }],
          temperature: config.temperature,
          model: config.model,
          systemPrompt: config.systemPrompt || ''
        });
        const reply = res.content || '无回复';
        zmlCore.replaceMsg(currentRequestId, reply);
        zmlState.replaceLastMessage(sessId, { role: 'assistant', content: reply, ts: Date.now() });
      } catch (e) {
        const errMsg = '错误：' + e.message;
        zmlCore.replaceMsg(currentRequestId, errMsg);
        zmlState.replaceLastMessage(sessId, { role: 'assistant', content: errMsg, ts: Date.now() });
      } finally {
        btn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        input.focus();
        isStreaming = false;
        currentRequestId = null;
      }
    })();
  }

  function stopGeneration() {
    if (!currentRequestId) return;
    const ok = window.desktop.cancelMessage(currentRequestId);
    if (ok) {
      zmlCore.showToast('已请求停止生成');
    }
  }

  function retryLast() {
    const sessId = window._activeSessionId || zmlState.getActiveId();
    if (!sessId) return;
    const sess = zmlState.getSession(sessId);
    if (!sess || !sess.messages || sess.messages.length === 0) return;
    const lastUser = [...sess.messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    const input = document.getElementById('chatInput');
    input.value = lastUser.content;
    sendMessage();
  }

  function clearCurrentSession() {
    const sessId = window._activeSessionId || zmlState.getActiveId();
    if (!sessId) return;
    zmlCore.clearMessages();
    zmlState.addMessageToSession(sessId, { role: 'system', content: '对话已清空', ts: Date.now() });
    zmlCore.showToast('当前对话已清空');
  }

  async function exportCurrentSession() {
    const sessId = window._activeSessionId || zmlState.getActiveId();
    if (!sessId) {
      zmlCore.showToast('没有可导出的会话');
      return;
    }
    const sess = zmlState.getSession(sessId);
    if (!sess) {
      zmlCore.showToast('会话不存在');
      return;
    }
    try {
      const result = await window.desktop.exportData(JSON.stringify(sess, null, 2));
      if (result.saved) {
        zmlCore.showToast('已导出到：' + result.filePath);
      }
    } catch (e) {
      zmlCore.showToast('导出失败：' + e.message);
    }
  }

  function initInput() {
    const input = document.getElementById('chatInput');
    const btn = document.getElementById('btnSend');
    const stopBtn = document.getElementById('btnStop');
    const clear = document.getElementById('btnClearChat');
    const retry = document.getElementById('btnRetry');
    const exportBtn = document.getElementById('btnExport');

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

    if (stopBtn) stopBtn.addEventListener('click', stopGeneration);
    if (clear) clear.addEventListener('click', clearCurrentSession);
    if (retry) retry.addEventListener('click', retryLast);
    if (exportBtn) exportBtn.addEventListener('click', exportCurrentSession);
  }

  return { sendMessage, stopGeneration, retryLast, clearCurrentSession, exportCurrentSession, initInput };
})();
