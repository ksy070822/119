# 푸시 알림 기능 구현 요약

## 📋 개요

보호자와 병원 간 양방향 푸시 알림 시스템이 구현되어 있습니다. 예약 생성 시 병원에 알림이 전송되고, 진료 완료 시 보호자에게 알림이 전송됩니다.

## 🏗️ 아키텍처

```
[보호자 앱]                    [병원 앱]
     │                              │
     ├─ 예약 생성                    │
     │   └─→ [Firestore]            │
     │       └─→ [notificationQueue] │
     │           └─→ [Cloud Functions] ─→ FCM ─→ [병원 앱]
     │                                                      │
     │                              [진료 완료]            │
     │                              └─→ [Firestore]        │
     │                                  └─→ [notificationQueue]
     │                                      └─→ [Cloud Functions] ─→ FCM ─→ [보호자 앱]
     │
```

## 🔄 데이터 흐름

### 1. 보호자 → 병원 (예약 신청)

```
1. 보호자가 예약 생성
   ↓
2. HospitalBooking.jsx에서 sendNotificationToClinicStaff() 호출
   ↓
3. clinicStaff 컬렉션에서 병원 스태프 조회
   ↓
4. 각 스태프의 fcmToken 수집
   ↓
5. notificationQueue 컬렉션에 알림 데이터 저장
   ↓
6. Cloud Functions (sendPushNotification) 자동 트리거
   ↓
7. FCM을 통해 병원 스태프에게 푸시 알림 전송
   ↓
8. 병원 앱에서 알림 수신
```

### 2. 병원 → 보호자 (진료 완료)

```
1. 병원에서 진료 완료 처리
   ↓
2. firestore.js의 clinicResultService.saveResult() 호출
   ↓
3. 진료 결과를 clinicResults 컬렉션에 저장
   ↓
4. sendNotificationToGuardian() 호출
   ↓
5. 보호자의 fcmToken 조회
   ↓
6. notificationQueue 컬렉션에 알림 데이터 저장
   ↓
7. Cloud Functions (sendPushNotification) 자동 트리거
   ↓
8. FCM을 통해 보호자에게 푸시 알림 전송
   ↓
9. 보호자 앱에서 알림 수신
```

## 📁 주요 파일 및 역할

### 1. 프론트엔드

#### `src/services/pushNotificationService.js`
**역할**: 푸시 알림 관리 서비스
- `requestPushPermission(userId)`: 푸시 알림 권한 요청 및 FCM 토큰 발급/저장
- `sendNotificationToClinicStaff(clinicId, title, body, data)`: 병원 스태프에게 알림 큐에 추가
- `sendNotificationToGuardian(userId, title, body, data)`: 보호자에게 알림 큐에 추가
- `setupForegroundMessageHandler(callback)`: 포그라운드 메시지 수신 처리

#### `src/lib/firebase.js`
**역할**: Firebase 초기화 및 Messaging 설정
- Firebase Messaging 초기화
- 브라우저 환경에서만 동작하도록 체크

#### `public/firebase-messaging-sw.js`
**역할**: Service Worker (백그라운드 알림 처리)
- 백그라운드에서 푸시 알림 수신
- 알림 표시 처리

#### `App.jsx`
**역할**: 앱 초기화 시 푸시 알림 설정
- 로그인 시 `requestPushPermission()` 호출
- 포그라운드 메시지 핸들러 설정

#### `src/components/HospitalBooking.jsx`
**역할**: 예약 생성 시 병원에 알림 전송
- 예약 생성 성공 후 `sendNotificationToClinicStaff()` 호출
- 알림 내용: "예약 신청이 접수되었습니다"

#### `src/services/firestore.js`
**역할**: 진료 결과 저장 시 보호자에 알림 전송
- `clinicResultService.saveResult()`에서 `sendNotificationToGuardian()` 호출
- 알림 내용: "{병원명}에서 진료한 결과가 전송되었습니다"

### 2. 백엔드 (Cloud Functions)

#### `functions/index.js`
**역할**: 푸시 알림 자동 전송
- `sendPushNotification`: notificationQueue에 새 문서 생성 시 자동 실행
  - `clinic_notification`: 병원 스태프들에게 배치 전송 (최대 500개씩)
  - `guardian_notification`: 보호자에게 단일 전송
  - 유효하지 않은 토큰 자동 제거
  - 전송 결과를 notificationQueue 문서에 업데이트
- `cleanupOldNotifications`: 주기적으로 오래된 알림 큐 정리 (24시간마다)

## 🔔 알림 시나리오

### 시나리오 1: 보호자 → 병원 (예약 신청)

**트리거**: 보호자가 병원 예약 생성

**알림 내용**:
- 제목: "예약 신청이 접수되었습니다"
- 본문: "{반려동물명}의 예약이 접수되었습니다. ({날짜} {시간})"

**수신자**: 해당 병원의 모든 활성 스태프 (`clinicStaff` 컬렉션에서 `isActive: true`인 스태프)

**구현 위치**: `src/components/HospitalBooking.jsx:485`

**코드 예시**:
```javascript
await sendNotificationToClinicStaff(
  actualClinicId,
  '예약 신청이 접수되었습니다',
  `${petData?.petName || '반려동물'}의 예약이 접수되었습니다. (${bookingDate} ${bookingTime})`,
  {
    type: 'booking_created',
    bookingId: result.id,
    clinicId: actualClinicId,
    petName: petData?.petName,
    date: bookingDate,
    time: bookingTime,
    url: '/clinic-dashboard'
  }
);
```

### 시나리오 2: 병원 → 보호자 (진료 완료)

**트리거**: 병원에서 진료 완료 처리 및 진료 결과 저장

**알림 내용**:
- 제목: "{병원명}에서 진료한 결과가 전송되었습니다"
- 본문: "{반려동물명}의 진료 결과를 확인해주세요."

**수신자**: 예약한 보호자

**구현 위치**: `src/services/firestore.js:372`

**코드 예시**:
```javascript
await sendNotificationToGuardian(
  resultData.userId,
  `${clinicName}에서 진료한 결과가 전송되었습니다`,
  `${resultData.petName || '반려동물'}의 진료 결과를 확인해주세요.`,
  {
    type: 'treatment_completed',
    resultId: docRef.id,
    bookingId: resultData.bookingId,
    petName: resultData.petName,
    clinicName: clinicName,
    url: '/records'
  }
);
```

## 🔧 기술 스택

### 프론트엔드
- **Firebase Cloud Messaging (FCM)**: 푸시 알림 전송
- **Firebase Firestore**: 토큰 저장 및 알림 큐 관리
- **Service Worker**: 백그라운드 알림 처리

### 백엔드
- **Firebase Cloud Functions (v2)**: 자동 푸시 알림 전송
- **Firebase Admin SDK**: FCM 메시지 전송
- **Firestore Triggers**: notificationQueue 문서 생성 시 자동 실행

## 📊 데이터 구조

### users 컬렉션
```javascript
{
  fcmToken: "FCM_토큰_문자열",
  fcmTokenUpdatedAt: "2025-12-02T10:00:00.000Z"
}
```

### notificationQueue 컬렉션
```javascript
{
  // 병원 알림
  type: "clinic_notification",
  clinicId: "clinic_id",
  title: "예약 신청이 접수되었습니다",
  body: "반려동물의 예약이 접수되었습니다.",
  tokens: ["token1", "token2", ...],
  data: { bookingId: "...", ... },
  sent: false,
  createdAt: "2025-12-02T10:00:00.000Z"
}

// 보호자 알림
{
  type: "guardian_notification",
  userId: "user_id",
  title: "병원에서 진료한 결과가 전송되었습니다",
  body: "반려동물의 진료 결과를 확인해주세요.",
  token: "fcm_token",
  data: { resultId: "...", ... },
  sent: false,
  createdAt: "2025-12-02T10:00:00.000Z"
}
```

### clinicStaff 컬렉션
```javascript
{
  clinicId: "clinic_id",
  userId: "user_id",
  role: "owner" | "staff",
  isActive: true
}
```

## ✅ 구현 완료 사항

### 프론트엔드
- ✅ Firebase Messaging 초기화
- ✅ Service Worker 설정
- ✅ 푸시 알림 권한 요청
- ✅ FCM 토큰 발급 및 저장
- ✅ 포그라운드 메시지 처리
- ✅ 예약 생성 시 병원에 알림 전송
- ✅ 진료 완료 시 보호자에 알림 전송

### 백엔드
- ✅ Cloud Functions 배포 완료
- ✅ notificationQueue 트리거 설정
- ✅ 병원 스태프 배치 전송 (최대 500개씩)
- ✅ 보호자 단일 전송
- ✅ 유효하지 않은 토큰 자동 제거
- ✅ 전송 결과 업데이트
- ✅ 오래된 알림 큐 정리 (24시간마다)

## 🧪 테스트 방법

### 1. 푸시 알림 토큰 발급 확인

1. 보호자 계정으로 로그인 (`guardian@test.com`)
2. 브라우저에서 알림 권한 허용
3. 브라우저 콘솔 확인:
   ```
   ✅ 푸시 알림 설정 완료
   푸시 알림 토큰 저장 완료: [토큰]
   ```
4. Firestore `users` 컬렉션에서 `fcmToken` 필드 확인

### 2. 예약 생성 테스트 (보호자 → 병원)

1. 보호자 계정으로 로그인
2. 반려동물 선택 → AI 진단 → 병원 예약 생성
3. 확인 사항:
   - Firestore `notificationQueue`에 새 문서 생성
   - `type: "clinic_notification"` 확인
   - `sent: true`로 변경되는지 확인 (몇 초 내)
   - **병원 계정 브라우저에서 푸시 알림 수신 확인**

### 3. 진료 완료 테스트 (병원 → 보호자)

1. 병원 계정으로 로그인 (`clinic@happyvet.com`)
2. 오늘 예약 확인 → 진료 완료 처리
3. 확인 사항:
   - Firestore `notificationQueue`에 새 문서 생성
   - `type: "guardian_notification"` 확인
   - `sent: true`로 변경되는지 확인 (몇 초 내)
   - **보호자 계정 브라우저에서 푸시 알림 수신 확인**

### 4. Functions 로그 확인

```bash
# 전체 로그
npx firebase-tools functions:log

# 특정 함수 로그
npx firebase-tools functions:log --only sendPushNotification
```

## 🔍 문제 해결

### 푸시 알림이 오지 않는 경우

1. **알림 권한 확인**
   - 브라우저 설정에서 알림 권한이 "허용"인지 확인
   - Chrome: 설정 → 개인정보 및 보안 → 사이트 설정 → 알림

2. **FCM 토큰 확인**
   - Firestore `users` 컬렉션에서 `fcmToken` 필드 확인
   - 토큰이 없으면 로그아웃 후 다시 로그인

3. **Functions 로그 확인**
   - `notificationQueue`에 알림이 추가되었는지 확인
   - `sent: false`인 경우 `error` 필드 확인
   - Functions 로그에서 에러 메시지 확인

4. **Service Worker 확인**
   - `public/firebase-messaging-sw.js` 파일이 배포되었는지 확인
   - 브라우저 개발자 도구 → Application → Service Workers

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

## 📈 성능 및 제한사항

### 배치 전송
- 병원 스태프 알림: 최대 500개씩 배치로 전송 (FCM 제한)
- 보호자 알림: 단일 전송

### 토큰 관리
- 유효하지 않은 토큰 자동 제거
- 사용자 문서에서 `fcmToken` 필드 자동 삭제

### 알림 큐 정리
- 30일 이상 된 전송 완료 알림 자동 삭제
- 24시간마다 실행 (cleanupOldNotifications)

## 🎯 주요 특징

1. **자동화**: Cloud Functions가 자동으로 푸시 알림 전송
2. **배치 처리**: 병원 스태프에게는 최대 500개씩 배치 전송
3. **에러 처리**: 유효하지 않은 토큰 자동 제거
4. **실시간**: notificationQueue에 추가되면 즉시 전송
5. **양방향**: 보호자 ↔ 병원 양방향 알림 지원

## 📝 참고 문서

- `PUSH_NOTIFICATION_SETUP.md`: 상세 설정 가이드
- `PUSH_NOTIFICATION_TEST_GUIDE.md`: 테스트 가이드
- `DEPLOYMENT_FIXED.md`: 배포 완료 확인

---

**푸시 알림 시스템이 완전히 구현되어 있고 배포되었습니다!** ✅

