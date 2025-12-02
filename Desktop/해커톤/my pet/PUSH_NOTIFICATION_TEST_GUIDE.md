# 푸시 알림 테스트 가이드

## ✅ 구현 완료 확인

모든 코드가 구현되어 있습니다:
- ✅ 푸시 알림 토큰 발급 (`App.jsx`)
- ✅ 예약 생성 시 병원에 푸시 알림 (`HospitalBooking.jsx`)
- ✅ 진료 완료 시 보호자에 푸시 알림 (`firestore.js`)
- ✅ Firebase Functions 배포 완료

## 🧪 테스트 절차

### 1단계: 보호자 계정 설정

1. **보호자 계정으로 로그인**
   - 이메일: `guardian@test.com`
   - 비밀번호: (설정된 비밀번호)

2. **알림 권한 허용**
   - 브라우저에서 알림 권한 팝업이 나타나면 **"허용"** 클릭
   - 브라우저 콘솔에서 확인:
     ```
     ✅ 푸시 알림 설정 완료
     푸시 알림 토큰 저장 완료: [토큰]
     ```

3. **Firestore 확인**
   - Firebase Console → Firestore
   - `users` 컬렉션 → `guardian@test.com` 사용자 문서
   - `fcmToken` 필드가 생성되었는지 확인

### 2단계: 병원 계정 설정

1. **병원 계정으로 로그인**
   - 이메일: `clinic@happyvet.com` (또는 다른 병원 계정)
   - 비밀번호: (설정된 비밀번호)

2. **알림 권한 허용**
   - 브라우저에서 알림 권한 팝업이 나타나면 **"허용"** 클릭
   - 브라우저 콘솔에서 확인:
     ```
     ✅ 푸시 알림 설정 완료
     푸시 알림 토큰 저장 완료: [토큰]
     ```

3. **병원 스태프 등록 확인**
   - Firebase Console → Firestore
   - `clinicStaff` 컬렉션 확인
   - 병원 계정의 `userId`가 `clinicId`와 연결되어 있는지 확인
   - `isActive: true`인지 확인

### 3단계: 예약 생성 테스트 (보호자 → 병원)

1. **보호자 계정 브라우저에서**
   - 반려동물 선택
   - 진단 완료 후 병원 예약 생성
   - 예약 날짜/시간 선택
   - 예약 확인

2. **확인 사항**
   - 브라우저 콘솔에서:
     ```
     ✅ 병원 스태프 푸시 알림 전송 완료
     ```
   - Firebase Console → Firestore:
     - `notificationQueue` 컬렉션에 새 문서 생성 확인
     - `type: "clinic_notification"` 확인
     - `sent: true`로 변경되는지 확인 (몇 초 내)
   - **병원 계정 브라우저에서 푸시 알림 수신 확인**

3. **병원 계정 브라우저에서**
   - 알림이 나타나면: **"예약 신청이 접수되었습니다"**
   - 알림 클릭 시 병원 대시보드로 이동하는지 확인

### 4단계: 진료 완료 테스트 (병원 → 보호자)

1. **병원 계정 브라우저에서**
   - 병원 대시보드에서 오늘 예약 확인
   - 예약 클릭 → 진료 완료 처리
   - 진료 결과 입력 및 저장

2. **확인 사항**
   - Firebase Console → Firestore:
     - `notificationQueue` 컬렉션에 새 문서 생성 확인
     - `type: "guardian_notification"` 확인
     - `sent: true`로 변경되는지 확인 (몇 초 내)
   - **보호자 계정 브라우저에서 푸시 알림 수신 확인**

3. **보호자 계정 브라우저에서**
   - 알림이 나타나면: **"[병원명]에서 진료한 결과가 전송되었습니다"**
   - 알림 클릭 시 진료 기록 화면으로 이동하는지 확인

## 🔍 문제 해결

### 푸시 알림이 오지 않는 경우

1. **알림 권한 확인**
   - 브라우저 설정에서 알림 권한이 "허용"인지 확인
   - Chrome: 설정 → 개인정보 및 보안 → 사이트 설정 → 알림

2. **FCM 토큰 확인**
   - Firestore `users` 컬렉션에서 `fcmToken` 필드 확인
   - 토큰이 없으면 로그아웃 후 다시 로그인

3. **Functions 로그 확인**
   ```bash
   npx firebase-tools functions:log --only sendPushNotification
   ```
   - 에러 메시지 확인
   - `sent: false`인 경우 에러 메시지 확인

4. **notificationQueue 확인**
   - Firestore `notificationQueue` 컬렉션 확인
   - `sent: false`인 경우 `error` 필드 확인

### 병원 스태프가 알림을 받지 못하는 경우

1. **clinicStaff 등록 확인**
   - Firestore `clinicStaff` 컬렉션 확인
   - `clinicId`가 올바른지 확인
   - `isActive: true`인지 확인
   - `userId`가 올바른지 확인

2. **사용자 FCM 토큰 확인**
   - `users` 컬렉션에서 병원 스태프의 `fcmToken` 확인
   - 토큰이 없으면 병원 계정으로 다시 로그인

### 보호자가 알림을 받지 못하는 경우

1. **사용자 FCM 토큰 확인**
   - Firestore `users` 컬렉션에서 보호자의 `fcmToken` 확인
   - 토큰이 없으면 보호자 계정으로 다시 로그인

2. **진료 결과 저장 확인**
   - `clinicResults` 컬렉션에 진료 결과가 저장되었는지 확인
   - `userId`가 올바른지 확인

## 📊 테스트 체크리스트

- [ ] 보호자 계정 로그인 및 알림 권한 허용
- [ ] 보호자 FCM 토큰 발급 확인 (Firestore)
- [ ] 병원 계정 로그인 및 알림 권한 허용
- [ ] 병원 FCM 토큰 발급 확인 (Firestore)
- [ ] 병원 스태프 등록 확인 (clinicStaff)
- [ ] 예약 생성 테스트
- [ ] notificationQueue에 알림 추가 확인
- [ ] Functions 실행 확인 (로그)
- [ ] 병원 계정에서 푸시 알림 수신 확인
- [ ] 진료 완료 테스트
- [ ] notificationQueue에 알림 추가 확인
- [ ] Functions 실행 확인 (로그)
- [ ] 보호자 계정에서 푸시 알림 수신 확인

## 🎯 예상 결과

### 정상 작동 시

1. **예약 생성 시**
   - 보호자가 예약 생성
   - `notificationQueue`에 알림 추가
   - Functions가 자동 실행
   - 병원 계정 브라우저에 푸시 알림 표시
   - 알림 클릭 시 병원 대시보드로 이동

2. **진료 완료 시**
   - 병원이 진료 완료 처리
   - `notificationQueue`에 알림 추가
   - Functions가 자동 실행
   - 보호자 계정 브라우저에 푸시 알림 표시
   - 알림 클릭 시 진료 기록 화면으로 이동

## ⚠️ 주의사항

1. **브라우저별 차이**
   - Chrome, Edge: 정상 작동
   - Safari: 제한적 지원
   - Firefox: 정상 작동

2. **HTTPS 필수**
   - 푸시 알림은 HTTPS 환경에서만 작동
   - 로컬 개발: `localhost`는 예외

3. **백그라운드 알림**
   - 브라우저가 백그라운드에 있어도 알림 수신 가능
   - Service Worker가 처리

**이제 테스트할 준비가 완료되었습니다!**

