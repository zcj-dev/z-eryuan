/**
 * Z 二次元 · 状态与会话管理（浏览器层，localStorage 持久化）
 * 职责：会话列表、当前会话切换、消息队列、API 配置读写
 */

const STORAGE_KEY_CONFIG = 'zml_api_config_v1';
const STORAGE_KEY_SESSIONS = 'zml_sessions_v1';
const STORAGE_KEY_ACTIVE = 'zml_active_session_id_v1';

const zmlState = (() => {
  // ---- API 配置 ----
  function loadApiConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (!raw) return { baseURL: '', apiKey: '', model: '', temperature: 0.7, systemPrompt: '' };
      return JSON.parse(raw);
    } catch { return { baseURL: '', apiKey: '', model: '', temperature: 0.7, systemPrompt: '' }; }
  }

  function saveApiConfig(config) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }

  // ---- 会话 ----
  function loadSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!raw) return [];
      const sessions = JSON.parse(raw);
      return Array.isArray(sessions) ? sessions : [];
    } catch { return []; }
  }

  function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }

  function newSession(title = '新对话') {
    const now = Date.now();
    return {
      id: 'sess_' + now + '_' + Math.random().toString(36).slice(2, 8),
      title,
      createdAt: now,
      updatedAt: now,
      messages: [],
      model: '',
      baseURL: ''
    };
  }

  function getActiveId() {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE) || null;
    } catch { return null; }
  }

  function setActiveId(id) {
    try { localStorage.setItem(STORAGE_KEY_ACTIVE, id); } catch {}
  }

  function getSession(id) {
    return loadSessions().find(s => s.id === id) || null;
  }

  function addMessageToSession(sessionId, message) {
    const sessions = loadSessions();
    const sess = sessions.find(s => s.id === sessionId);
    if (!sess) return false;
    if (!sess.messages) sess.messages = [];
    sess.messages.push(message);
    sess.updatedAt = Date.now();
    if (!sess.title || sess.title === '新对话') {
      const firstUser = sess.messages.find(m => m.role === 'user');
      if (firstUser) sess.title = firstUser.content.slice(0, 24) + (firstUser.content.length > 24 ? '…' : '');
    }
    saveSessions(sessions);
    return true;
  }

  function replaceLastMessage(sessionId, message) {
    const sessions = loadSessions();
    const sess = sessions.find(s => s.id === sessionId);
    if (!sess || !sess.messages || sess.messages.length === 0) return false;
    sess.messages[sess.messages.length - 1] = message;
    sess.updatedAt = Date.now();
    saveSessions(sessions);
    return true;
  }

  function deleteSession(id) {
    let sessions = loadSessions();
    sessions = sessions.filter(s => s.id !== id);
    saveSessions(sessions);
    const active = getActiveId();
    if (active === id) setActiveId(sessions.length > 0 ? sessions[0].id : null);
    return sessions;
  }

  function renameSession(id, title) {
    const sessions = loadSessions();
    const sess = sessions.find(s => s.id === id);
    if (!sess) return false;
    sess.title = title;
    sess.updatedAt = Date.now();
    saveSessions(sessions);
    return true;
  }

  return {
    loadApiConfig,
    saveApiConfig,
    loadSessions,
    saveSessions,
    newSession,
    getActiveId,
    setActiveId,
    getSession,
    addMessageToSession,
    replaceLastMessage,
    deleteSession,
    renameSession
  };
})();
