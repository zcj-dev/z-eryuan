const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

const { loadConfig, saveConfig } = require('./config')
const { proxyChatCompletion } = require('./api')

let mainWindow
let apiConfig = loadConfig()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('zml:get-api-config', async () => {
  return apiConfig
})

ipcMain.handle('zml:set-api-config', async (_, config) => {
  apiConfig = { ...apiConfig, ...config }
  saveConfig(apiConfig)
  return { ok: true }
})

ipcMain.handle('zml:chat-completion', async (_, payload) => {
  return proxyChatCompletion(apiConfig, payload)
})
