# FecyJ's Homepage

[![Lint](https://github.com/FecyJ/homepage/actions/workflows/lint.yml/badge.svg)](https://github.com/FecyJ/homepage/actions/workflows/lint.yml)
[![Deploy](https://github.com/FecyJ/homepage/actions/workflows/deploy.yml/badge.svg)](https://github.com/FecyJ/homepage/actions/workflows/deploy.yml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ffecyj.github.io%2Fhomepage%2F&label=homepage)](https://fecyj.github.io/homepage/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

这是我的个人网站源码仓库，用于记录学习、项目与生活。网站基于 [Astro](https://astro.build/) 和 [Mizuki](https://github.com/LyraVoid/Mizuki) 构建，通过 GitHub Actions 自动检查并发布到 GitHub Pages。

- 在线访问：[https://fecyj.github.io/homepage/](https://fecyj.github.io/homepage/)
- 主题上游：[LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki)
- 维护说明：[docs/MAINTENANCE.md](docs/MAINTENANCE.md)
- 内容写作指南：[docs/CONTENT_AUTHORING.md](docs/CONTENT_AUTHORING.md)

> 当前仓库已经完成个人站点骨架、长期分支和部署配置。正式使用前，请继续替换姓名、头像、简介、示例文章和演示数据。

## 技术栈

- Astro 7、TypeScript 6、Svelte 5
- Tailwind CSS、Stylus
- Pagefind 静态全文搜索
- Biome 格式与代码检查
- Node.js 22.13.0、pnpm 11.5.3
- GitHub Actions 与 GitHub Pages

## 本地开发

```bash
git clone git@github.com:FecyJ/homepage.git
cd homepage

nvm install
nvm use
corepack enable
corepack prepare pnpm@11.5.3 --activate
pnpm install --frozen-lockfile

cp .env.example .env
pnpm dev
```

开发服务器默认运行在 `http://localhost:3000`。本地 `.env` 建议保持：

```dotenv
ENABLE_CONTENT_SYNC=false
CONTENT_DIR=./content
MIZUKI_FONT_MODE=system
MIZUKI_BASE=/
```

不要提交包含令牌、Cookie 或其他凭据的 `.env` 文件。

## 个性化入口

个人配置集中在覆盖层，尽量不要直接修改主题默认配置：

| 内容 | 修改位置 |
| --- | --- |
| 站名、域名、语言、首页文案 | `src/config/overrides/siteConfig.ts` |
| 姓名、简介、头像、社交链接 | `src/config/overrides/profileConfig.ts` |
| 导航菜单 | `src/config/overrides/navBarConfig.ts` |
| 关于页 | `src/content/spec/about.md` |
| 博客文章 | `src/content/posts/` |
| 项目、技能、时间线等数据 | `src/data/` |
| 公共图片和相册 | `public/images/` |

新增文章：

```bash
pnpm new-post -- my-first-post
```

发布前执行完整验证：

```bash
pnpm verify
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 构建生产站点到 `dist/` |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm check` | 运行 Astro 诊断 |
| `pnpm type-check` | 运行 TypeScript 类型检查 |
| `pnpm test` | 运行自动化测试 |
| `pnpm lint` | 运行 Biome 检查 |
| `pnpm format:check` | 检查代码格式 |
| `pnpm verify` | 依次运行环境、格式、代码、类型、测试和构建检查 |

## 长期分支结构

本仓库采用个人主线与主题上游分离的维护方式：

| 分支或远程 | 作用 | 是否承载个人修改 |
| --- | --- | --- |
| `origin/main` | 个人网站主线，也是默认分支 | 是 |
| `upstream/master` | Mizuki 官方主题基线 | 否 |
| 本地 `master` | 跟踪并快进同步 `upstream/master` | 否 |
| `pages` | GitHub Actions 自动生成的部署产物 | 否，禁止手动修改 |

首次克隆后配置上游：

```bash
git remote add upstream https://github.com/LyraVoid/Mizuki.git
git remote set-url --push upstream DISABLED
git fetch upstream
git switch -c master --track upstream/master
git switch main
```

日常个人内容更新直接提交到 `main`：

```bash
git switch main
git pull --ff-only origin main

# 编辑文章、配置或图片后
pnpm verify
git add <files>
git commit -m "content: update homepage"
git push origin main
```

接收主题上游更新：

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

如预期冲突较多，建议从 `main` 创建 `chore/update-mizuki` 临时分支完成合并和验证，再合回 `main`。详细说明见 [个人站点维护指南](docs/MAINTENANCE.md)。

## 自动部署

推送到 `main` 后会触发两组工作流：

1. `Lint`：运行 Biome、Astro 类型检查和生产构建。
2. `Deploy to Pages Branch`：构建站点并把 `dist/` 发布到 `pages` 分支。

GitHub Pages 从 `pages` 分支根目录提供网站。由于当前使用项目站点路径 `/homepage/`，CI 中设置了：

```dotenv
MIZUKI_BASE=/homepage
```

若以后绑定独立域名，需要同时把 `src/config/overrides/siteConfig.ts` 中的 `siteURL` 改为新域名，并将工作流中的 `MIZUKI_BASE` 改为 `/`。

## 文档

- [个人站点维护指南](docs/MAINTENANCE.md)
- [内容写作指南](docs/CONTENT_AUTHORING.md)
- [部署指南](docs/DEPLOYMENT.md)
- [内容分离指南](docs/CONTENT_SEPARATION.md)
- [项目文档索引](docs/README.md)
- [Mizuki 官方文档](https://docs.mizuki.mysqil.com/)

## 致谢与许可

本项目基于 [Mizuki](https://github.com/LyraVoid/Mizuki) 进行二次开发，Mizuki 基于 [Fuwari](https://github.com/saicaca/fuwari)，并参考或使用了 Firefly、Twilight、Yukina、Pio 等开源项目的设计与实现。

仓库遵循 [Apache License 2.0](LICENSE)。原始项目及第三方组件的许可与版权信息见 [LICENSE.MIT](LICENSE.MIT) 和 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
