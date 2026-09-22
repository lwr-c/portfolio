#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTFOLIO_DIR="$(dirname "$REPO_DIR")"
GH_BIN="$PORTFOLIO_DIR/.portfolio-tools/bin/gh"
export GH_CONFIG_DIR="$PORTFOLIO_DIR/.portfolio-tools/gh-config"

# GitHub CLI does not automatically read the macOS system proxy.
# Reuse the user's current HTTPS proxy without changing system settings.
if [[ -z "${HTTPS_PROXY:-${https_proxy:-}}" ]] && command -v scutil >/dev/null; then
  PORTFOLIO_PROXY="$(scutil --proxy | awk '
    $1 == "HTTPSEnable" { enabled = $3 }
    $1 == "HTTPSProxy" { host = $3 }
    $1 == "HTTPSPort" { port = $3 }
    END { if (enabled == 1 && host != "" && port != "") print "http://" host ":" port }
  ')"
  if [[ -n "$PORTFOLIO_PROXY" ]]; then
    export HTTPS_PROXY="$PORTFOLIO_PROXY" HTTP_PROXY="$PORTFOLIO_PROXY"
  fi
fi

if [[ ! -x "$GH_BIN" || ! -f "$PORTFOLIO_DIR/design-preview/scripts/sync_github_pages.py" ]]; then
  echo '找不到本机更新工具或源作品集，请保持桌面 portfolio 文件夹的结构。' >&2
  exit 1
fi
"$GH_BIN" auth status --hostname github.com >/dev/null 2>&1 || {
  echo 'GitHub 上传登录已失效，请先重新登录 GitHub CLI。' >&2
  exit 1
}
cd "$REPO_DIR"
if [[ "$(git symbolic-ref --short -q HEAD || true)" != main ]]; then
  echo '请先切换到 main 分支后再更新作品集。' >&2
  exit 1
fi
if ! git diff --cached --quiet; then
  echo '仓库有已暂存的更改，请先处理这些更改后再使用一键更新。' >&2
  exit 1
fi
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo 'GitHub 上有本地尚未整合的更新，请先整合远端改动后再发布。' >&2
  exit 1
fi
echo '正在生成作品集页面……'
python3 "$PORTFOLIO_DIR/design-preview/scripts/build_site.py"
python3 "$PORTFOLIO_DIR/design-preview/scripts/sync_github_pages.py"
python3 "$PORTFOLIO_DIR/design-preview/scripts/sync_github_pages.py" --check
git add -- docs README.md publish.sh .gitignore wrangler.jsonc
if ! git diff --cached --quiet; then
  git commit -m "Update portfolio $(date '+%Y-%m-%d %H:%M')"
fi
PENDING_COMMITS="$(git rev-list --count origin/main..HEAD)"
git push origin main
if [[ "$PENDING_COMMITS" -gt 0 ]]; then
  echo '新提交已上传到 GitHub，Cloudflare 将自动部署。上传成功不等于网站已更新。'
  echo '请确认 Cloudflare 中对应最新提交的生产部署显示绿色成功，再刷新网站。'
else
  echo '没有待上传的新提交，本次未触发新的 Git 自动部署。'
fi
echo '作品集：https://cocoportfolio.top/'
echo 'Cloudflare 发布进度：https://dash.cloudflare.com/52b3296e1f6964201c0087ee4a57d82d/workers/services/view/twilight-boat-62a7/production/deployments'
echo 'GitHub Pages 备用地址：https://lwr-c.github.io/portfolio/'
