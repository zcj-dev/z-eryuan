/**
 * Z 二次元 · 应用入口
 * 初始化路由、状态、全局事件，兼容 Electron IPC 与浏览器直开
 */

window.app = {};
window.zmlAPI = window.zmlAPI || {};

document.addEventListener('DOMContentLoaded', () => {
  // 生成 DID 身份
  const did = zmlCore.genDid();
  const didEl = document.getElementById('didValue');
  if (didEl) didEl.textContent = did;

  // 初始化设置（读取本地配置）
  zmlSettings.init();

  // 初始化对话输入
  zmlChat.initInput();

  // 视图切换
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
      this.classList.add('active');
      document.getElementById('pageTitle').textContent = view === 'chat' ? '对话' : '设置';
      zmlCore.updateStatusBar(
        'barDot', 'barText',
        !!window._currentConfig.baseURL,
        window._currentConfig.model,
        window._currentConfig.baseURL
      );
    });
  });

  // 暴露给 HTML inline 调用
  window.app.switchView = function (name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    document.querySelector('[data-view="' + name + '"]').classList.add('active');
    document.getElementById('pageTitle').textContent = name === 'chat' ? '对话' : '设置';
  };
  window.app.setPreset = zmlSettings.setPreset;
  window.app.saveApiConfig = zmlSettings.saveApiConfig;
  window.app.testApiConnection = zmlSettings.testApiConnection;
});
