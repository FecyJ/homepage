# 个人站点维护指南

本仓库采用“上游主题 + 少量个人覆盖”的方式维护。目标是让 `src/config/` 中的主题默认配置尽量保持不变，把个人设置集中在 `src/config/overrides/`，从而减少合并上游时的冲突。

## 环境

- Node.js：22.12.0 或更高版本
- pnpm：11.5.3 或更高版本

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@11.5.3 --activate
pnpm install --frozen-lockfile
pnpm check-env
```

本地 `.env` 推荐保持：

```dotenv
ENABLE_CONTENT_SYNC=false
CONTENT_DIR=./content
MIZUKI_FONT_MODE=system
MIZUKI_BASE=/
```

确认基础站点稳定后，如需主题自带字体，再把字体模式改为 `custom`。

## 个人化入口

优先修改以下位置：

1. `src/config/overrides/siteConfig.ts`：站名、正式域名、语言和首页文案。
2. `src/config/overrides/profileConfig.ts`：姓名、简介、头像和社交链接。
3. `src/config/overrides/navBarConfig.ts`：导航菜单。
4. `src/content/spec/about.md`：关于页。
5. `src/content/posts/`：文章。
6. `src/data/`：项目、技能、时间线等结构化页面数据。

当前部署地址配置为 `https://fecyj.github.io/homepage/`，CI 构建时使用 `MIZUKI_BASE=/homepage`。如果以后绑定独立域名，请把 `siteURL` 改为新域名，并把 CI 中的 `MIZUKI_BASE` 改为 `/`。

## 日常验证

```bash
pnpm check-env
pnpm check
pnpm type-check
pnpm test
pnpm build
pnpm preview
```

也可以运行完整验证：

```bash
pnpm verify
```

`pnpm lint` 和 `pnpm format:check` 只检查；需要自动修改时再使用 `pnpm lint:fix` 或 `pnpm format`。

## 接收上游更新

推荐远程命名：

- `origin`：你的个人网站仓库
- `upstream`：Mizuki 官方仓库
- `main`：个人站点与自动部署分支
- `master`：保持为上游镜像

每次更新前先提交个人修改，然后执行：

```bash
git status
git fetch upstream --prune
git switch master
git merge --ff-only upstream/master
git switch main
git merge master
pnpm install --frozen-lockfile
pnpm verify
```

其中 `--ff-only` 只用于不承载个人修改的 `master`；个人分支通过普通 merge 接收已经确认过的上游提交。若预期冲突较多，可先建立临时更新分支：

```bash
git switch main
git switch -c chore/update-mizuki
git merge master
pnpm install --frozen-lockfile
pnpm verify
```

避免在接收上游前使用 `git reset --hard`。发生冲突时优先保留 `src/config/overrides/` 和个人内容，再按上游的新类型定义调整覆盖字段。

## 内容分离

个人站点初期保持 `ENABLE_CONTENT_SYNC=false`。需要独立内容仓库时，再按照 `docs/CONTENT_SEPARATION.md` 迁移；迁移完成后应把 `src/config/overrides/` 移到内容仓库，并重新启用 `.gitignore` 中对应的忽略规则。
