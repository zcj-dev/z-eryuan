/**
 * Z 二次元 · 设置逻辑（API 配置、预设、连接测试）
 */

const zmlSettings = (() => {
  const PRESETS = {
    custom: { baseURL: '', model: '' },
    litellm: { baseURL: 'http://localhost:4000/v1', model: '' },
    ollama: { baseURL: 'http://localhost:11434/v1', model: 'gemma4:12b' }
  };

  function init() {
    const config = zmlState.loadApiConfig();
    window._currentConfig = config;

    const b = document.getElementById('inpBaseURL');
    const k = document.getElementById('inpApiKey');
    const m = document.getElementById('inpModel');
    const temp = document.getElementById('inpTemperature');
    const sys = document.getElementById('inpSystemPrompt');
    if (b) b.value = config.baseURL || '';
    if (k) k.value = config.apiKey || '';
    if (m) m.value = config.model || '';
    if (temp) temp.value = config.temperature || 0.7;
    if (sys) sys.value = config.systemPrompt || '';

    zmlCore.updateStatusBar('statusDot', 'statusText', !!config.baseURL, config.model, config.baseURL);
    zmlCore.updateStatusBar('barDot', 'barText', !!config.baseURL, config.model, config.baseURL);
    markPreset(config.baseURL);
  }

  function markPreset(baseURL) {
    document.querySelectorAll('.preset-item').forEach(item => {
      const inp = item.querySelector('input');
      if (!inp) return;
      const match = PRESETS[inp.value] && PRESETS[inp.value].baseURL && baseURL.startsWith(PRESETS[inp.value].baseURL);
      item.classList.toggle('selected', match);
    });
  }

  function setPreset(type) {
    const b = document.getElementById('inpBaseURL');
    const m = document.getElementById('inpModel');
    const p = PRESETS[type] || { baseURL: '', model: '' };
    if (b) b.value = p.baseURL;
    if (m) m.value = p.model;
    document.querySelectorAll('.preset-item').forEach(item => {
      const inp = item.querySelector('input');
      item.classList.toggle('selected', inp && inp.value === type);
    });
    zmlCore.updateStatusBar('barDot', 'barText', !!p.baseURL, p.model, p.baseURL);
  }

  async function saveApiConfigAction() {
    const config = {
      baseURL: document.getElementById('inpBaseURL').value.trim(),
      apiKey: document.getElementById('inpApiKey').value.trim(),
      model: document.getElementById('inpModel').value.trim(),
      temperature: parseFloat(document.getElementById('inpTemperature').value) || 0.7,
      systemPrompt: document.getElementById('inpSystemPrompt').value.trim()
    };

    if (!config.baseURL || !config.model) {
      zmlCore.showToast('Base URL 和 Model 都不能为空');
      return;
    }
    try {
      new URL(config.baseURL);
    } catch {
      zmlCore.showToast('Base URL 不是合法地址');
      return;
    }

    try {
      await window.desktop.saveSettings(config);
      zmlState.saveApiConfig(config);
      window._currentConfig = config;
      zmlCore.updateStatusBar('statusDot', 'statusText', true, config.model, config.baseURL);
      zmlCore.updateStatusBar('barDot', 'barText', true, config.model, config.baseURL);
      zmlCore.showResult('apiResult', true, '配置已保存到本机');
      zmlCore.showToast('API 配置已保存');
      markPreset(config.baseURL);
    } catch (e) {
      zmlCore.showResult('apiResult', false, '保存失败：' + e.message);
    }
  }

  async function testApiConnection() {
    const config = window._currentConfig || zmlState.loadApiConfig();
    if (!config.baseURL || !config.model) {
      zmlCore.showToast('请先填写 API 配置');
      return;
    }

    try {
      const res = await window.desktop.sendMessage({
        requestId: 'zml_ping_' + Date.now(),
        messages: [{ role: 'user', content: 'ping' }],
        temperature: 0.1,
        model: config.model,
        systemPrompt: ''
      });
      const content = res.content || 'OK';
      zmlCore.showResult('apiResult', true, 'API 连接正常：' + content.slice(0, 40));
      zmlCore.showToast('API 连接正常');
    } catch (e) {
      zmlCore.showResult('apiResult', false, '连接失败：' + e.message);
      zmlCore.showToast('API 连接失败：' + e.message);
    }
  }

  return { init, setPreset, saveApiConfig: saveApiConfigAction, testApiConnection };
})();
