/**
 * Z 梧墨朗 · 冒烟测试
 * 验证项目关键文件完整性
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const REQUIRED_FILES = [
  'package.json',
  'electron-builder.json',
  '.gitignore',
  'LICENSE',
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'src/main/index.js',
  'src/main/api.js',
  'src/main/config.js',
  'src/preload/index.js',
  'src/renderer/index.html',
  'src/renderer/css/style.css',
  'src/renderer/js/zml-core.js',
  'src/renderer/js/zml-settings.js',
  'src/renderer/js/zml-chat.js',
  'src/renderer/js/zml-app.js',
  'tests/smoke.test.js',
  'docs/usage.md',
  'docs/deploy.md'
]

let failed = 0

for (const file of REQUIRED_FILES) {
  const fullPath = path.join(ROOT, file)
  if (fs.existsSync(fullPath)) {
    console.log('✓', file)
  } else {
    console.log('✗', file)
    failed++
  }
}

console.log('\n' + (failed === 0 ? '所有必需文件存在' : `${failed} 个文件缺失`))
process.exit(failed === 0 ? 0 : 1)
