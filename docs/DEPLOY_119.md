# 119 리포에 게임만 올리기

**클론해 둔 폴더 없을 때** — 아래만 하면 됩니다.

---

## 1단계: 스크립트 한 번 실행

터미널에서:

```bash
cd "/Users/may.08/Desktop/AI 자동화 구축 모음/장애대응/payment-crisis-rpg"
chmod +x scripts/setup-119-from-zero.sh
./scripts/setup-119-from-zero.sh
```

이 스크립트가 하는 일:
- GitHub에서 119 리포를 받아서 `payment-crisis-rpg/119-deploy` 폴더에 둠
- 그 안에 있던 파일은 다 지우고, **게임 파일만** 넣음
- 끝나면 **뭘 해야 하는지 3줄**을 출력해 줌

---

## 2단계: 나온 3줄 복사해서 터미널에 붙여넣기

스크립트가 끝나면 대략 이런 게 나옵니다. **이 3줄만** 그대로 복사해서 터미널에 붙여넣고 실행하세요.

```bash
cd "/Users/may.08/Desktop/AI 자동화 구축 모음/장애대응/payment-crisis-rpg/119-deploy"
git add -A && git commit -m "Game only"
git push origin main
```

`git push` 할 때 GitHub 로그인 창이 뜨면 로그인하면 됩니다.  
(에러로 `main`이 없다고 나오면 `git push origin gh-pages` 로 한 번 더 시도해 보세요.)

---

## 3단계: GitHub에서 Pages 켜기 (한 번만)

1. 브라우저에서 **https://github.com/ksy070822/119** 들어가기  
2. **Settings** → 왼쪽에서 **Pages**  
3. **Build and deployment** → **Source** 를 **GitHub Actions** 로 선택하고 저장  

몇 분 지나면 **https://ksy070822.github.io/119/** 에서 게임이 열립니다.
