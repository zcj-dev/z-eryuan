const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', Object.freeze({
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  saveSettings: (config) => ipcRenderer.invoke('settings:save', config),
  sendMessage: (payload) => ipcRenderer.invoke('chat:send', payload),
  cancelMessage: (requestId) => ipcRenderer.invoke('chat:cancel', requestId),
  exportData: (contents) => ipcRenderer.invoke('data:export', contents)
}))
