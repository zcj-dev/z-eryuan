/**
 * Z 二次元 · 应用入口（路由切换、会话侧栏、状态初始化）
 */

const zmlApp = (() => {
  let activeSessionId = null;

  function switchView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const view = document.getElementById('view-' + name);
    const nav = document.querySelector('[data-view="' + name + '"]');
    if (view) view.classList.add('active');
    if (nav) nav.classList.add('active');
    document.getElementById('pageTitle').textContent = name === 'chat' ? '对话' : '设置';
  }

  function renderSessionList() {
    const list = document.getElementById('sessionList');
    if (!list) return;
    const sessions = zmlState.loadSessions().slice().sort((a, b) => b.updatedAt - a.updatedAt);
    list.innerHTML = '';
    sessions.forEach(sess => {
      const item = document.createElement('div');
      item.className = 'session-item' + (sess.id === activeSessionId ? ' active' : '');
      item.title = sess.title;
      item.innerHTML = '<div class="session-title" title="' + sess.title + '">' + (sess.title || '新对话') + '</div>'
        + '<div class="session-time">' + new Date(sess.updatedAt).toLocaleString() + '</div>';
      item.addEventListener('click', () => openSession(sess.id));
      list.appendChild(item);
    });
  }

  function openSession(id) {
    activeSessionId = id;
    zmlState.setActiveId(id);
    window._activeSessionId = id;
    renderSessionList();
    renderSessionMessages(id);
    switchView('chat');
  }

  function renderSessionMessages(id) {
    zmlCore.clearMessages();
    const sess = zmlState.getSession(id);
    if (!sess) return;
    (sess.messages || []).forEach(msg => {
      if (msg.role === 'system') {
        zmlCore.appendMsg('meta', msg.content, { timestamp: msg.ts });
      } else {
        zmlCore.appendMsg(msg.role, msg.content, { timestamp: msg.ts });
      }
    });
  }

  function newSession() {
    const sess = zmlState.newSession();
    zmlState.saveSessions([sess, ...zmlState.loadSessions().filter(s => s.id !== sess.id)]);
    openSession(sess.id);
  }

  function deleteSession(id) {
    const sessions = zmlState.deleteSession(id);
    renderSessionList();
    if (activeSessionId === id) {
      if (sessions.length > 0) openSession(sessions[0].id);
      else {
        activeSessionId = null;
        window._activeSessionId = null;
        zmlCore.clearMessages();
        switchView('chat');
      }
    }
  }

  function init() {
    // DID
    const did = zmlCore.genDid();
    const didEl = document.getElementById('didValue');
    if (didEl) didEl.textContent = did;

    // 设置初始化
    zmlSettings.init();

    // 侧边栏事件
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function () {
        const view = this.getAttribute('data-view');
        if (view === 'chat') switchView('chat');
        else if (view === 'settings') switchView('settings');
      });
    });

    const newBtn = document.getElementById('btnNewSession');
    if (newBtn) newBtn.addEventListener('click', newSession);

    const delBtn = document.getElementById('btnDeleteSession');
    if (delBtn) delBtn.addEventListener('click', () => {
      if (!activeSessionId) return;
      if (!confirm('确定删除当前会话吗？')) return;
      deleteSession(activeSessionId);
    });

    // 对话输入
    zmlChat.initInput();

    // 恢复上次会话或新建
    const lastId = zmlState.getActiveId();
    if (lastId && zmlState.getSession(lastId)) {
      openSession(lastId);
    } else {
      newSession();
    }
  }

  return {
    init,
    switchView,
    openSession,
    newSession,
    deleteSession,
    renderSessionList,
    setActiveSessionId(id) { activeSessionId = id; }
  };
})();
