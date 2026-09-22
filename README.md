# COCO · 李文睿作品集

研究、内容、产品与策略实践的个人作品集。

在线网站：https://cocoportfolio.top/

本仓库存放经过链接校验的公开网站。向 GitHub 的 `main` 分支推送新提交后，Cloudflare 会自动部署 `docs` 中的静态网站；每次更新后，域名保持不变。

GitHub Pages 备用地址：https://lwr-c.github.io/portfolio/

## 在这台 Mac 上更新

1. 在桌面 `portfolio/design-preview` 中修改作品集内容，或让 Codex 帮你修改。
2. 双击桌面 `portfolio/更新作品集.command`。
3. 脚本会重新生成页面、校验并同步公开资源、提交变更和推送。推送新提交后，Cloudflare 开始自动部署。
4. 打开下方的 Cloudflare 部署状态页，确认对应最新提交的生产部署显示绿色成功后，再刷新 https://cocoportfolio.top/ 查看更新。若仍显示旧内容，可强制刷新浏览器。

上传到 GitHub 成功不等于网站已经更新。若没有新提交，脚本不会触发新的 Git 自动部署；若部署失败，先查看 Cloudflare 的部署日志并修复错误，再重新部署。

在终端运行也可以：

```sh
bash /Users/coco/Desktop/portfolio/github-pages/publish.sh
```

日常内容在 `design-preview/content/projects.json`，页面模板在 `design-preview/scripts/build_site.py`，样式在 `design-preview/*.css`。添加作品时同时调整构建脚本中的作品数量与分类断言。不要直接编辑 `docs` 中的生成页面，下次同步会以本地源文件为准。

目前南风窗视频使用已核对的压缩版本。源视频改变后，同步脚本会停止并要求更新压缩视频及其校验值，避免上传旧视频或超过 GitHub 的单文件限制。

原始稿件、内部核对材料、历史分享包和登录凭据保存在本地，未加入仓库。GitHub 上的公开网站可直接浏览；这份发布仓库不包含重建原始素材的全部工作文件。

## 发布配置

- GitHub 仓库：`lwr-c/portfolio`，生产分支：`main`
- Cloudflare Worker：`twilight-boat-62a7`
- 仓库根目录的 `wrangler.jsonc` 指定静态资源目录 `./docs`
- Cloudflare 部署命令：`npx wrangler deploy`
- Cloudflare 部署状态：https://dash.cloudflare.com/52b3296e1f6964201c0087ee4a57d82d/workers/services/view/twilight-boat-62a7/production/deployments
- GitHub Pages 继续从 `main` 分支的 `/docs` 发布备用站点；保留 `docs/.nojekyll`
- GitHub Pages 备用站点部署状态：https://github.com/lwr-c/portfolio/actions

若远端已有其他设备提交，更新脚本会停止推送，先拉取并整合修改后再发布；不会强制覆盖远端。
