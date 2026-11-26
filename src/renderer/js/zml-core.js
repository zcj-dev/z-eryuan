/**
 * Z 梧墨朗 · 核心模块（浏览器原生 JS，无模块系统依赖）
 * 提供：DID 生成、消息气泡、Toast 提示、Markdown 简单渲染
 */

const zmlCore = (() => {
  function genDid() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return 'did:zml:' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMarkdown(text) {
    let html = escapeHtml(text);
    // 代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 换行
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function appendMsg(role, text) {
    const wrap = document.getElementById('messages');
    if (!wrap) return;

    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : 'zml');
    div.innerHTML = renderMarkdown(text);

    const meta = document.createElement('div');
    meta.className = 'msg meta';
    meta.textContent = role === 'user'
      ? '用户 · ' + new Date().toLocaleTimeString()
      : 'Z 梧墨朗 · ' + new Date().toLocaleTimeString();

    wrap.appendChild(div);
    wrap.appendChild(meta);
    wrap.scrollTop = wrap.scrollHeight;

    // 隐藏空状态
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'none';

    return div;
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

  return {
    genDid,
    appendMsg,
    showToast,
    showResult,
    hideResult,
    updateStatusBar
  };
})();
