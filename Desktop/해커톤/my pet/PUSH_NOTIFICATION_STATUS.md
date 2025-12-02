# 푸시 알림 서비스 상태 확인

## ✅ 배포 완료 확인

Firebase Functions가 이미 배포되어 있습니다:

1. **sendPushNotification** (v2)
   - 위치: us-central1
   - 트리거: `notificationQueue/{notificationId}` 문서 생성 시
   - 상태: ✅ 배포됨

2. **cleanupOldNotifications** (v2)
   - 위치: us-central1
   - 트리거: 매일 24시간마다
   - 상태: ✅ 배포됨

## 🧪 테스트 방법

### 1. 푸시 알림 토큰 발급 확인

1. 앱 실행 → 로그인 (rain8477@gmail.com 또는 guardian@test.com)
2. 브라우저에서 알림 권한 허용
3. 브라우저 콘솔 확인:
   - "푸시 알림 토큰 저장 완료" 메시지 확인
   - Firestore `users` 컬렉션에서 `fcmToken` 필드 확인

### 2. 예약 생성 테스트

1. **보호자 계정으로 로그인** (guardian@test.com)
2. **병원 예약 생성**
3. **확인 사항**:
   - Firestore `notificationQueue` 컬렉션에 새 문서 생성 확인
   - `sent` 필드가 `true`로 변경되는지 확인 (몇 초 내)
   - Firebase Console → Functions → 로그에서 실행 로그 확인
   - **병원 계정 브라우저에서 푸시 알림 수신 확인**

### 3. 진료 완료 테스트

1. **병원 계정으로 로그인** (clinic@happyvet.com)
2. **예약에 대해 진료 완료 처리**
3. **확인 사항**:
   - Firestore `notificationQueue` 컬렉션에 새 문서 생성 확인
   - `sent` 필드가 `true`로 변경되는지 확인
   - **보호자 계정 브라우저에서 푸시 알림 수신 확인**

## 🔍 문제 진단

### Functions가 작동하지 않을 경우

1. **로그 확인**:
   ```bash
   npx firebase-tools functions:log --only sendPushNotification
   ```

2. **Firebase Console에서 확인**:
   - Firebase Console → Functions → 로그 탭
   - 에러 메시지 확인

3. **일반적인 문제**:
   - VAPID 키가 없으면 토큰 발급 실패
   - 사용자에게 `fcmToken`이 없으면 전송 실패
   - IAM 권한 문제 (이미 해결됨)

## 📊 현재 상태

- ✅ VAPID 키 설정 완료
- ✅ Functions 코드 작성 완료
- ✅ Functions 배포 완료
- ✅ Google Sheets 동기화 연계 완료
- ⏳ 실제 테스트 필요

## 🎯 다음 단계

1. **앱에서 알림 권한 허용** (각 사용자)
2. **예약 생성 테스트**
3. **푸시 알림 수신 확인**
4. **문제 발생 시 로그 확인**

**배포는 완료되었습니다! 이제 테스트만 하면 됩니다.**

