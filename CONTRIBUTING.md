# 贡献指南

感谢你愿意参与 Z 二次元的开发！

## 如何贡献

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/your-feature`
3. 提交你的更改：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 打开一个 Pull Request

## 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/辅助工具变更

示例：

```
feat: add preset for local Ollama endpoint
fix: chat input height adjustment on mobile
docs: update usage guide
```

## 代码规范

- 前端使用原生 JavaScript，不依赖框架
- CSS 使用 CSS 变量，保持深色主题一致性
- 提交前请运行 `npm test` 确保冒烟测试通过

## 问题反馈

使用 [GitHub Issues](https://github.com/zcj-dev/z-eryuan/issues) 提交 Bug 报告或功能请求。
