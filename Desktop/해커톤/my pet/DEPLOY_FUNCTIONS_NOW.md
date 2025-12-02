# Cloud Functions 배포 - 지금 바로!

## ✅ 완료된 작업
- ✅ ESLint 오류 모두 수정 완료
- ✅ 코드 스타일 Google 가이드 준수
- ✅ Functions 코드 검증 통과

## 🔐 Firebase 로그인 필요

배포를 위해 Firebase에 로그인해야 합니다.

### 방법 1: 브라우저 로그인 (권장)

터미널에서 다음 명령어 실행:

```bash
cd "/Users/may.08/Desktop/해커톤/my pet"
npx firebase-tools login
```

브라우저가 열리면 Google 계정으로 로그인하세요.

### 방법 2: 이미 로그인되어 있다면

프로젝트 확인:
```bash
npx firebase-tools use ai-factory-c6d58
```

## 🚀 배포 실행

로그인 후:

```bash
cd "/Users/may.08/Desktop/해커톤/my pet"
npx firebase-tools deploy --only functions
```

## 📋 배포 과정

1. **ESLint 검사** ✅ (통과)
2. **Functions 빌드**
3. **Firebase에 업로드**
4. **배포 완료**

배포가 완료되면:
- `sendPushNotification`: 알림 자동 전송 함수
- `cleanupOldNotifications`: 오래된 알림 정리 함수 (매일 실행)

## ⚠️ 중요

배포가 완료되어야 실제로 푸시 알림이 작동합니다!

현재 상태:
- ✅ 코드 완성
- ✅ ESLint 통과
- ⏳ Firebase 로그인 필요
- ⏳ 배포 대기 중

로그인 후 배포를 진행하세요!

