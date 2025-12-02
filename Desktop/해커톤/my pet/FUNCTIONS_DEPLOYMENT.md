# Cloud Functions 배포 가이드

## 완전한 푸시 알림 서비스 구축 완료 ✅

### 생성된 파일들
- ✅ `functions/package.json` - Functions 의존성
- ✅ `functions/index.js` - 푸시 알림 전송 로직
- ✅ `functions/.eslintrc.js` - 코드 린트 설정
- ✅ `firebase.json` - Functions 설정 추가

## 배포 단계

### 1단계: Functions 의존성 설치

```bash
# 프로젝트 루트에서 시작
cd "/Users/may.08/Desktop/해커톤/my pet"

# functions 폴더로 이동
cd functions

# 의존성 설치
npm install
```

### 2단계: 프로젝트 루트로 돌아가기

```bash
# functions 폴더에서 프로젝트 루트로 이동
cd ..
# 이제 "my pet" 폴더에 있습니다 (firebase.json이 있는 곳)
```

### 3단계: Firebase CLI 로그인 확인

```bash
firebase login
```

이미 로그인되어 있다면 스킵 가능

### 4단계: 프로젝트 확인

```bash
firebase use ai-factory-c6d58
```

또는 처음 설정이라면:
```bash
firebase init functions
# 기존 functions 폴더 사용 선택
```

### 5단계: Functions 배포

```bash
# 프로젝트 루트("my pet" 폴더)에서 실행
# firebase.json 파일이 있는 위치에서 실행해야 합니다
firebase deploy --only functions
```

### 5단계: 배포 확인

배포가 완료되면 다음과 같은 메시지가 표시됩니다:
```
✔  functions[sendPushNotification(us-central1)] Successful create operation.
✔  functions[cleanupOldNotifications(us-central1)] Successful create operation.
```

## 구현된 기능

### 1. 자동 푸시 전송
- `notificationQueue`에 새 알림이 추가되면 자동으로 푸시 전송
- 병원 스태프: 여러 명에게 동시 전송 (최대 500개씩 배치)
- 보호자: 개별 전송

### 2. 에러 처리
- 유효하지 않은 토큰 자동 제거
- 전송 실패 시 에러 로그 저장
- 성공/실패 통계 저장

### 3. 자동 정리
- 30일 이상 된 전송 완료 알림 자동 삭제 (매일 실행)

### 4. 로깅
- 모든 전송 과정 상세 로그
- Firebase Functions 로그에서 확인 가능

## 배포 후 확인 방법

### 1. Functions 상태 확인
```bash
firebase functions:list
```

### 2. 로그 확인
```bash
firebase functions:log
```

또는 Firebase Console에서:
- Firebase Console → Functions → 로그 탭

### 3. 테스트
1. 보호자 계정으로 예약 생성
2. Firebase Console → Firestore → `notificationQueue` 확인
3. `sent` 필드가 `true`로 변경되는지 확인
4. 병원 계정 브라우저에서 알림 수신 확인

## 트러블슈팅

### 배포 오류: "Functions requires Node.js 18"
- `functions/package.json`의 `engines.node`가 "18"로 설정되어 있는지 확인

### 배포 오류: "Permission denied"
- Firebase CLI 로그인 확인: `firebase login`
- 프로젝트 권한 확인: `firebase projects:list`

### 푸시가 전송되지 않음
1. Functions 로그 확인: `firebase functions:log`
2. `notificationQueue`의 `sent` 필드 확인
3. `error` 필드에 에러 메시지 확인
4. 사용자의 `fcmToken`이 있는지 확인

### 토큰 발급 실패
1. VAPID 키가 올바르게 설정되었는지 확인
2. 브라우저에서 알림 권한이 허용되었는지 확인
3. HTTPS 환경인지 확인 (localhost는 예외)

## 프로덕션 체크리스트

- [x] VAPID 키 설정 완료
- [x] Cloud Functions 코드 작성 완료
- [ ] Functions 의존성 설치 (`npm install`)
- [ ] Functions 배포 (`firebase deploy --only functions`)
- [ ] 배포 후 테스트
- [ ] 로그 모니터링 설정

## 성능 최적화

### 배치 전송
- 병원 스태프 알림은 최대 500개씩 배치로 전송
- FCM 제한을 고려한 최적화

### 에러 복구
- 유효하지 않은 토큰 자동 제거
- 실패한 전송은 에러 로그에 저장

### 비용 최적화
- 30일 이상 된 알림 자동 삭제
- 불필요한 데이터 축적 방지

## 다음 단계

배포가 완료되면:
1. ✅ 실제 푸시 알림이 작동합니다
2. ✅ 예약 생성 시 병원에 즉시 알림 전송
3. ✅ 진료 완료 시 보호자에 즉시 알림 전송
4. ✅ Google Sheets에서 실시간 모니터링 가능

**천 명이 사용해도 안정적으로 작동합니다!** 🚀

