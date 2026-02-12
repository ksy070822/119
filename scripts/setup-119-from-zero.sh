#!/usr/bin/env bash
# 클론한 적 없을 때: 119 리포 받아서 게임만 넣기 (한 번에 실행)
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="$GAME_DIR/119-deploy"
REPO_URL="https://github.com/ksy070822/119.git"

echo "1) 119 리포 받는 중..."
if [ -d "$DEPLOY_DIR" ]; then
  rm -rf "$DEPLOY_DIR"
fi
git clone "$REPO_URL" "$DEPLOY_DIR"
echo ""

echo "2) 안에 있던 거 지우고 게임만 넣는 중..."
for f in "$DEPLOY_DIR"/* "$DEPLOY_DIR"/.[!.]* "$DEPLOY_DIR"/..?*; do
  [ -e "$f" ] || continue
  [ "$f" = "$DEPLOY_DIR/.git" ] && continue
  rm -rf "$f"
done
rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='.vercel' \
  --exclude='*.log' --exclude='.env' --exclude='.env.*' --exclude='.DS_Store' \
  --exclude='119-repo-clean' --exclude='119-deploy' \
  "$GAME_DIR/" "$DEPLOY_DIR/"
mkdir -p "$DEPLOY_DIR/.github/workflows"
cp "$GAME_DIR/docs/deploy-119-root.yml" "$DEPLOY_DIR/.github/workflows/deploy.yml"
echo ""

echo "=============================================="
echo "끝났어요. 이제 아래 3줄만 터미널에 붙여넣기 하세요."
echo "=============================================="
echo ""
echo "cd \"$DEPLOY_DIR\""
echo "git add -A && git commit -m \"Game only\""
echo "git push origin main"
echo ""
echo "(main 안 되면: git push origin gh-pages)"
echo "=============================================="
echo "푸시 후: GitHub 119 리포 → Settings → Pages → Source 를 GitHub Actions 로 두면 됩니다."
