const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('zmlAPI', {
  getApiConfig: () => ipcRenderer.invoke('zml:get-api-config'),
  setApiConfig: (config) => ipcRenderer.invoke('zml:set-api-config', config),
  chatCompletion: (payload) => ipcRenderer.invoke('zml:chat-completion', payload)
})
