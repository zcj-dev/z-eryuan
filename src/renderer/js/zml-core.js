/**
 * Z 二次元 · UI 核心（浏览器原生 JS，无框架依赖）
 * 职责：消息气泡、Markdown 渲染、Toast、DID、DOM 可见性
 */

const zmlCore = (() => {
  // 生成本机身份 did:zml:...
  function genDid() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return 'did:zml:' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }

  // 转义 HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 简单 Markdown 渲染：代码块、行内代码、加粗、斜体、链接、换行
  function renderMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  // 追加一条消息（气泡），返回消息元素
  function appendMsg(role, content, { id = null, timestamp = null, highlight = false } = {}) {
    const wrap = document.getElementById('messages');
    if (!wrap) return null;

    const msg = document.createElement('div');
    msg.className = 'msg ' + role + (highlight ? ' msg-highlight' : '');
    if (id) msg.dataset.id = id;
    msg.innerHTML = renderMarkdown(content);
    if (timestamp) {
      const meta = document.createElement('div');
      meta.className = 'msg meta';
      meta.textContent = (role === 'user' ? '用户' : 'Z 二次元') + ' · ' + new Date(timestamp).toLocaleTimeString();
      wrap.appendChild(meta);
    }
    wrap.appendChild(msg);
    wrap.scrollTop = wrap.scrollHeight;

    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'none';

    return msg;
  }

  // 替换某条消息内容（用于停止后显示片段，或重试覆盖）
  function replaceMsg(id, content) {
    const msg = document.querySelector('.msg[data-id="' + id + '"]');
    if (!msg) return false;
    msg.innerHTML = renderMarkdown(content);
    return true;
  }

  // 追加一条正在生成的消息（流式占位符）
  function appendStreamingMsg(role, id) {
    const msg = document.createElement('div');
    msg.className = 'msg ' + role;
    msg.dataset.id = id;
    msg.dataset.streaming = 'true';
    msg.innerHTML = '<span class="stream-placeholder"></span>';
    const wrap = document.getElementById('messages');
    wrap.appendChild(msg);
    wrap.scrollTop = wrap.scrollHeight;
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'none';
    return msg;
  }

  // 更新流式消息内容（每片段增量）
  function updateStreamingMsg(id, content) {
    const msg = document.querySelector('.msg[data-id="' + id + '"]');
    if (!msg) return false;
    const ph = msg.querySelector('.stream-placeholder');
    if (ph) ph.textContent = content;
    else msg.innerHTML = renderMarkdown(content);
    const wrap = document.getElementById('messages');
    wrap.scrollTop = wrap.scrollHeight;
    return true;
  }

  function showToast(msg, duration = 2500) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  function showResult(boxId, ok, msg) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.textContent = msg;
    box.className = 'result-box show ' + (ok ? 'ok' : 'err');
  }

  function hideResult(boxId) {
    const box = document.getElementById(boxId);
    if (box) box.classList.remove('show');
  }

  function updateStatusBar(dotId, textId, ready, model, baseURL) {
    const dot = document.getElementById(dotId);
    const txt = document.getElementById(textId);
    if (ready && model && baseURL) {
      if (dot) dot.className = 'dot ok';
      if (txt) txt.textContent = 'API 已就绪：' + model + ' @ ' + baseURL;
    } else {
      if (dot) dot.className = 'dot';
      if (txt) txt.textContent = '未配置 API';
    }
  }

  function clearMessages() {
    const wrap = document.getElementById('messages');
    if (wrap) wrap.innerHTML = '';
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'flex';
  }

  return {
    genDid,
    appendMsg,
    replaceMsg,
    appendStreamingMsg,
    updateStreamingMsg,
    showToast,
    showResult,
    hideResult,
    updateStatusBar,
    clearMessages
  };
})();
