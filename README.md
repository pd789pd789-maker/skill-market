# Skill Atlas

中文优先的 AI Agent Skill 精选目录站，聚合 Codex、Claude、Cursor、Gemini 的高质量可下载技能与插件来源。

## 特性

- `Next.js + TypeScript + Tailwind CSS`，App Router 静态预渲染
- 首页、技能目录、技能详情、来源合集详情四个核心入口
- GitHub catalog 同步脚本，输出完整详情数据和轻量搜索索引
- GitHub 源超时或限流时自动回退到最近一次成功快照
- `Vitest + Testing Library` 覆盖 adapter、去重、回退和页面筛选交互
- GitHub Actions 每日同步 catalog，适合与 Vercel 自动部署联动

## 本地运行

```bash
pnpm install --ignore-scripts
pnpm sync-catalog
pnpm dev
```

默认打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
pnpm sync-catalog
pnpm lint
pnpm test
pnpm build
```

## 数据来源

- [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [ComposioHQ/awesome-codex-skills](https://github.com/ComposioHQ/awesome-codex-skills)
- [anthropics/skills](https://github.com/anthropics/skills)
- [openai/plugins](https://github.com/openai/plugins)

`openai/skills` 作为 deprecated 历史来源保留，不进首页主榜单。

## 同步与快照

- 生成文件位于 `src/generated/`
- `catalog-full.json` 给服务端详情页和静态生成使用
- `catalog-search.json` 给客户端筛选和搜索使用
- `catalog-meta.json` 用来显示“数据是否回退到快照”

当 GitHub API 限流、超时或返回错误时，同步脚本会回退到仓库内已有快照，因此构建不会被阻塞。

如果你在 Vercel 或 GitHub Actions 中配置了 `GITHUB_TOKEN`，同步成功率和速率都会更高。

## 部署到 Vercel

1. 新建 GitHub 仓库并推送当前项目。
2. 在 Vercel 导入该仓库。
3. 构建命令保持默认 `pnpm build`。
4. 可选添加环境变量 `GITHUB_TOKEN`，用于提升 catalog 同步的 GitHub API 额度。
5. 每次 GitHub Actions 自动提交 catalog 更新后，Vercel 会自动重建站点。

## 目录结构

```text
src/
  app/
  components/catalog/
  generated/
  lib/catalog/
scripts/
  sync-catalog.ts
.github/workflows/
  sync-catalog.yml
```
