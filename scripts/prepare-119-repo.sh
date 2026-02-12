#!/usr/bin/env bash
# 119 리포를 "게임만" 깨끗하게 채우기
# 사용법:
#   ./scripts/prepare-119-repo.sh                    → ./119-repo-clean 에 준비
#   ./scripts/prepare-119-repo.sh /path/to/119       → 해당 폴더 비우고 게임만 넣기 (.git 유지)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_YML="$GAME_DIR/docs/deploy-119-root.yml"

if [ -n "$1" ]; then
  TARGET="$(cd "$1" && pwd)"
  if [ ! -d "$TARGET/.git" ]; then
    echo "Error: $TARGET has no .git (not a git clone?). Use clone first."
    exit 1
  fi
  echo "Target 119 clone: $TARGET"
  # 119 폴더 비우기 (.git 제외)
  for f in "$TARGET"/* "$TARGET"/.[!.]* "$TARGET"/..?*; do
    [ -e "$f" ] || continue
    [ "$f" = "$TARGET/.git" ] && continue
    rm -rf "$f"
  done
  # 게임 파일 복사
  rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='.vercel' \
    --exclude='*.log' --exclude='.env' --exclude='.env.*' --exclude='.DS_Store' \
    "$GAME_DIR/" "$TARGET/"
  mkdir -p "$TARGET/.github/workflows"
  cp "$DEPLOY_YML" "$TARGET/.github/workflows/deploy.yml"
  echo "Done. Next: cd $TARGET && git add -A && git status && git commit -m 'Game only' && git push"
  exit 0
fi

# 기본: 119-repo-clean 생성 (복사용)
CLEAN_DIR="$GAME_DIR/119-repo-clean"
echo "Preparing $CLEAN_DIR (copy this into your 119 clone)"
rm -rf "$CLEAN_DIR"
mkdir -p "$CLEAN_DIR"
rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='.vercel' \
  --exclude='*.log' --exclude='.env' --exclude='.env.*' --exclude='.DS_Store' \
  --exclude='119-repo-clean' \
  "$GAME_DIR/" "$CLEAN_DIR/"
mkdir -p "$CLEAN_DIR/.github/workflows"
cp "$DEPLOY_YML" "$CLEAN_DIR/.github/workflows/deploy.yml"
echo "Done. Copy contents of 119-repo-clean into your 119 repo (keep .git), then commit and push."
