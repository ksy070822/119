# Firebase 로그인 및 배포 가이드

## 현재 상황
- ✅ 프로젝트 설정: `ai-factory-c6d58` (.firebaserc에 설정됨)
- ❌ Firebase 로그인 필요: 현재 로그인된 계정 없음
- ⏳ 배포 대기 중

## 로그인 방법

### 1단계: 터미널에서 로그인

터미널에서 다음 명령어를 실행하세요:

```bash
cd "/Users/may.08/Desktop/해커톤/my pet"
npx firebase-tools login
```

브라우저가 자동으로 열리고:
1. Google 계정 선택 화면이 나타납니다
2. **rain8477@gmail.com** 계정을 선택하세요
3. 권한 허용을 클릭하세요
4. 터미널에 "Success! Logged in as rain8477@gmail.com" 메시지가 나타납니다

### 2단계: 프로젝트 확인

로그인 후 프로젝트 목록 확인:

```bash
npx firebase-tools projects:list | grep ai-factory
```

`ai-factory-c6d58` 프로젝트가 보여야 합니다.

### 3단계: 배포 실행

프로젝트가 확인되면 배포:

```bash
npx firebase-tools deploy --only functions
```

## 문제 해결

### 프로젝트가 목록에 없을 경우

1. Firebase Console에서 확인:
   - https://console.firebase.google.com/
   - rain8477@gmail.com으로 로그인
   - `ai-factory-c6d58` 프로젝트가 있는지 확인

2. 프로젝트 접근 권한 확인:
   - 프로젝트가 다른 계정에 있을 수 있습니다
   - 프로젝트 소유자에게 권한 요청 필요

### 로그인 후에도 배포 실패할 경우

프로젝트 ID를 명시적으로 지정:

```bash
npx firebase-tools deploy --only functions --project ai-factory-c6d58
```

## 빠른 체크리스트

- [ ] `npx firebase-tools login` 실행
- [ ] rain8477@gmail.com 계정으로 로그인
- [ ] `npx firebase-tools projects:list`로 프로젝트 확인
- [ ] `npx firebase-tools deploy --only functions` 실행
- [ ] 배포 완료 확인

로그인 후 알려주시면 배포를 진행하겠습니다!

