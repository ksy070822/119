# 배포 가이드

## GitHub Pages 배포

이 프로젝트는 GitHub Pages를 통해 자동으로 배포됩니다.

### 배포 URL

배포가 완료되면 다음 URL에서 접근할 수 있습니다:
```
https://ksy070822.github.io/ai-factory/
```

### 자동 배포 설정

1. **GitHub 저장소 설정**
   - 저장소 페이지로 이동: https://github.com/ksy070822/ai-factory
   - Settings → Pages 메뉴로 이동
   - Source를 "GitHub Actions"로 선택

2. **자동 배포**
   - `main` 브랜치에 푸시하면 자동으로 배포됩니다
   - GitHub Actions 탭에서 배포 상태를 확인할 수 있습니다

### 수동 배포

```bash
# 빌드
npm run build

# dist 폴더를 gh-pages 브랜치에 푸시
npm install -g gh-pages
gh-pages -d dist
```

### 환경 변수 설정

GitHub Pages에서는 환경 변수를 직접 설정할 수 없으므로, 필요한 경우 빌드 시점에 환경 변수를 주입해야 합니다.

`.env` 파일의 API 키는 클라이언트 측에서 사용되므로, GitHub Pages에 배포할 때는:
- API 키가 코드에 노출되지 않도록 주의
- 또는 환경 변수 대신 다른 방식으로 관리

### 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드 미리보기
npm run build
npm run preview
```

### 문제 해결

1. **404 에러**: `vite.config.js`의 `base` 경로가 올바른지 확인
2. **빌드 실패**: GitHub Actions 로그 확인
3. **API 키 오류**: 환경 변수 설정 확인

