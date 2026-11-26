/**
 * Z 二次元 · 设置逻辑
 */

const zmlSettings = (() => {
  const STORAGE_KEY = 'zml_api_config';

  function loadApiConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { baseURL: '', apiKey: '', model: '' };
    } catch (e) {
      return { baseURL: '', apiKey: '', model: '' };
    }
  }

  function saveApiConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function init() {
    const config = loadApiConfig();
    window._currentConfig = config;

    const b = document.getElementById('inpBaseURL');
    const k = document.getElementById('inpApiKey');
    const m = document.getElementById('inpModel');
    if (b) b.value = config.baseURL || '';
    if (k) k.value = config.apiKey || '';
    if (m) m.value = config.model || '';

    zmlCore.updateStatusBar('statusDot', 'statusText', !!config.baseURL, config.model, config.baseURL);
    zmlCore.updateStatusBar('barDot', 'barText', !!config.baseURL, config.model, config.baseURL);
  }

  function setPreset(type) {
    const b = document.getElementById('inpBaseURL');
    const m = document.getElementById('inpModel');

    if (type === 'litellm') {
      if (b) b.value = 'http://localhost:4000/v1';
      if (m) m.value = '';
    } else if (type === 'ollama') {
      if (b) b.value = 'http://localhost:11434/v1';
      if (m) m.value = 'gemma4:12b';
    } else {
      if (b) b.value = '';
      if (m) m.value = '';
    }

    document.querySelectorAll('.preset-item').forEach(item => {
      const inp = item.querySelector('input');
      const selected = (type === 'litellm' && inp.value === 'litellm') ||
        (type === 'ollama' && inp.value === 'ollama') ||
        (type === 'custom' && inp.value === 'custom');
      item.classList.toggle('selected', selected);
    });
  }

  async function saveApiConfigAction() {
    const config = {
      baseURL: document.getElementById('inpBaseURL').value.trim(),
      apiKey: document.getElementById('inpApiKey').value.trim(),
      model: document.getElementById('inpModel').value.trim()
    };

    if (!config.baseURL || !config.model) {
      zmlCore.showToast('Base URL 和 Model 都不能为空');
      return;
    }

    try {
      await window.zmlAPI.setApiConfig(config);
      saveApiConfig(config);
      window._currentConfig = config;
      zmlCore.updateStatusBar('statusDot', 'statusText', true, config.model, config.baseURL);
      zmlCore.updateStatusBar('barDot', 'barText', true, config.model, config.baseURL);
      zmlCore.showResult('apiResult', true, '配置已保存到本地');
      zmlCore.showToast('API 配置已保存');
    } catch (e) {
      zmlCore.showResult('apiResult', false, '保存失败：' + e.message);
    }
  }

  async function testApiConnection() {
    const config = window._currentConfig || loadApiConfig();
    if (!config.baseURL || !config.model) {
      zmlCore.showToast('请先填写 API 配置');
      return;
    }

    try {
      const res = await window.zmlAPI.chatCompletion({
        messages: [{ role: 'user', content: 'ping' }],
        temperature: 0.1
      });
      const content = res.choices?.[0]?.message?.content || 'OK';
      zmlCore.showResult('apiResult', true, 'API 连接正常：' + content.slice(0, 40));
      zmlCore.showToast('API 连接正常');
    } catch (e) {
      zmlCore.showResult('apiResult', false, '连接失败：' + e.message);
      zmlCore.showToast('API 连接失败：' + e.message);
    }
  }

  return {
    init,
    setPreset,
    saveApiConfig: saveApiConfigAction,
    testApiConnection
  };
})();
