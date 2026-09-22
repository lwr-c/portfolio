# COCO · 李文睿作品集

研究、内容、产品与策略实践的个人作品集。

在线网站：https://lwr-c.github.io/portfolio/

本仓库存放经过链接校验的公开网站。GitHub Pages 从 `main` 分支的 `/docs` 自动发布；每次推送后，访问地址保持不变。

## 在这台 Mac 上更新

1. 在桌面 `portfolio/design-preview` 中修改作品集内容，或让 Codex 帮你修改。
2. 双击桌面 `portfolio/更新作品集.command`。
3. 脚本会重新生成页面、校验并同步公开资源、提交变更和推送。GitHub 随后自动更新网站。

在终端运行也可以：

```sh
bash /Users/coco/Desktop/portfolio/github-pages/publish.sh
```

日常内容在 `design-preview/content/projects.json`，页面模板在 `design-preview/scripts/build_site.py`，样式在 `design-preview/*.css`。添加作品时同时调整构建脚本中的作品数量与分类断言。不要直接编辑 `docs` 中的生成页面，下次同步会以本地源文件为准。

目前南风窗视频使用已核对的压缩版本。源视频改变后，同步脚本会停止并要求更新压缩视频及其校验值，避免上传旧视频或超过 GitHub 的单文件限制。

原始稿件、内部核对材料、历史分享包和登录凭据保存在本地，未加入仓库。GitHub 上的公开网站可直接浏览；这份发布仓库不包含重建原始素材的全部工作文件。

## 发布配置

- 分支：`main`
- 目录：`/docs`
- `docs/.nojekyll`：保留静态文件原样发布
- 部署状态：https://github.com/lwr-c/portfolio/actions

若远端已有其他设备提交，更新脚本会停止推送，先拉取并整合修改后再发布；不会强制覆盖远端。
