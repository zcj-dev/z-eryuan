const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const { createConfigStore, publicConfig } = require('./config')
const { proxyChatCompletion } = require('./api')

const store = createConfigStore(path.join(app.getPath('userData'), 'config.json'))
const pendingRequests = new Map()
let mainWindow = null
let apiConfig

function assertTrustedSender(event) {
  const url = event.senderFrame?.url || event.sender.getURL()
  if (!url.startsWith('file://')) throw new Error('拒绝来自非本地页面的请求')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    backgroundColor: '#f5f5f3',
    title: 'Z 二次元',
    icon: path.join(__dirname, '../../build/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault()
  })
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  mainWindow.on('closed', () => { mainWindow = null })
}

function registerIpc() {
  ipcMain.handle('app:bootstrap', (event) => {
    assertTrustedSender(event)
    return {
      config: publicConfig(apiConfig),
      version: app.getVersion(),
      platform: process.platform,
      storagePath: path.join(app.getPath('userData'), 'conversations.json')
    }
  })

  ipcMain.handle('settings:save', (event, input) => {
    assertTrustedSender(event)
    apiConfig = store.save(input)
    return publicConfig(apiConfig)
  })

  ipcMain.handle('chat:send', async (event, payload) => {
    assertTrustedSender(event)
    const id = String(payload?.requestId || '')
    if (!/^zml_[a-zA-Z0-9_-]{4,80}$/.test(id)) throw new Error('无效请求 ID')
    const controller = new AbortController()
    pendingRequests.set(id, controller)
    try {
      return await proxyChatCompletion(apiConfig, payload, { signal: controller.signal })
    } finally {
      pendingRequests.delete(id)
    }
  })

  ipcMain.handle('chat:cancel', (event, id) => {
    assertTrustedSender(event)
    const controller = pendingRequests.get(String(id))
    if (!controller) return false
    controller.abort(new Error('用户停止生成'))
    return true
  })

  ipcMain.handle('data:export', async (event, contents) => {
    assertTrustedSender(event)
    if (typeof contents !== 'string' || contents.length > 20_000_000) throw new Error('导出数据无效或过大')
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出对话',
      defaultPath: path.join(app.getPath('documents'), `Z-二次元-对话-${new Date().toISOString().slice(0, 10)}.json`),
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return { saved: false }
    fs.writeFileSync(result.filePath, contents, 'utf8')
    return { saved: true, filePath: result.filePath }
  })
}

app.whenReady().then(() => {
  try {
    apiConfig = store.load()
  } catch (error) {
    dialog.showErrorBox('配置读取失败', error.message)
    apiConfig = store.save({})
  }
  registerIpc()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('before-quit', () => { for (const controller of pendingRequests.values()) controller.abort() })
