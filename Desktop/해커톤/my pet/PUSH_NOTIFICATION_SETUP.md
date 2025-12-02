# 푸시 알림 설정 가이드

## 구현 완료 사항

### 1. Firebase Messaging 초기화
- `my pet/src/lib/firebase.js`: Firebase Messaging 추가
- `my pet/public/firebase-messaging-sw.js`: Service Worker 생성

### 2. 푸시 알림 서비스
- `my pet/src/services/pushNotificationService.js`: 푸시 알림 관리 서비스
  - `requestPushPermission()`: 푸시 알림 권한 요청 및 토큰 저장
  - `sendNotificationToClinicStaff()`: 병원 스태프에게 알림 전송
  - `sendNotificationToGuardian()`: 보호자에게 알림 전송
  - `setupForegroundMessageHandler()`: 포그라운드 메시지 처리

### 3. 예약 생성 시 알림
- `my pet/src/components/HospitalBooking.jsx`: 예약 생성 시 병원에 푸시 알림 전송

### 4. 진료 완료 시 알림
- `my pet/src/services/firestore.js`: 진료 결과 저장 시 보호자에게 푸시 알림 전송

### 5. 앱 초기화
- `my pet/App.jsx`: 로그인 시 푸시 알림 권한 요청 및 포그라운드 메시지 핸들러 설정

## 알림 시나리오

### 1. 보호자 → 병원
- **트리거**: 보호자가 예약 신청
- **알림 내용**: "예약 신청이 접수되었습니다"
- **수신자**: 해당 병원의 모든 활성 스태프
- **구현 위치**: `HospitalBooking.jsx`

### 2. 병원 → 보호자
- **트리거**: 병원에서 진료 완료 처리
- **알림 내용**: "{병원명}에서 진료한 결과가 전송되었습니다"
- **수신자**: 예약한 보호자
- **구현 위치**: `firestore.js` - `clinicResultService.saveResult()`

## 추가 설정 필요 사항

### 1. VAPID 키 발급
Firebase Console에서 VAPID 키를 발급받아야 합니다:

1. Firebase Console → 프로젝트 설정 → Cloud Messaging
2. "웹 푸시 인증서" 섹션에서 키 쌍 생성
3. 생성된 키를 `my pet/src/services/pushNotificationService.js`의 `VAPID_KEY`에 설정

```javascript
const VAPID_KEY = '발급받은_VAPID_키';
```

### 2. 실제 푸시 전송 구현

현재는 알림 데이터를 `notificationQueue` 컬렉션에 저장하는 방식입니다.
실제 푸시를 전송하려면 다음 중 하나를 구현해야 합니다:

#### 옵션 1: Cloud Functions 사용 (권장)
```javascript
// functions/index.js
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document('notificationQueue/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    if (notification.type === 'clinic_notification') {
      // 병원 스태프들에게 전송
      const messages = notification.tokens.map(token => ({
        token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      }));
      
      await admin.messaging().sendAll(messages);
    } else if (notification.type === 'guardian_notification') {
      // 보호자에게 전송
      await admin.messaging().send({
        token: notification.token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      });
    }
    
    // 전송 완료 표시
    await snap.ref.update({ sent: true });
  });
```

#### 옵션 2: 백엔드 서버에서 처리
백엔드 서버에서 `notificationQueue` 컬렉션을 모니터링하고 FCM Admin SDK로 푸시 전송

### 3. Service Worker 등록 확인

`index.html` 또는 `main.jsx`에서 Service Worker가 등록되는지 확인:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker 등록 성공:', registration);
    })
    .catch((error) => {
      console.error('Service Worker 등록 실패:', error);
    });
}
```

## 테스트 방법

### 1. 푸시 알림 권한 확인
- 브라우저에서 알림 권한이 허용되어 있는지 확인
- 개발자 도구 → Application → Notifications

### 2. 예약 생성 테스트
1. 보호자 계정으로 로그인
2. 병원 예약 생성
3. Firestore의 `notificationQueue` 컬렉션 확인
4. 병원 계정에서 알림 수신 확인

### 3. 진료 완료 테스트
1. 병원 계정으로 로그인
2. 예약에 대해 진료 완료 처리
3. Firestore의 `notificationQueue` 컬렉션 확인
4. 보호자 계정에서 알림 수신 확인

## 주의사항

1. **HTTPS 필수**: 푸시 알림은 HTTPS 환경에서만 작동합니다 (localhost는 예외)
2. **브라우저 지원**: Chrome, Firefox, Edge 등 최신 브라우저에서만 지원
3. **권한 요청**: 사용자가 알림 권한을 거부하면 푸시 알림이 작동하지 않습니다
4. **토큰 관리**: 사용자 로그아웃 시 토큰을 삭제하거나, 주기적으로 토큰을 갱신해야 합니다

## Google Sheets 동기화 연계

### notificationQueue 컬렉션 동기화
푸시 알림 상태를 Google Sheets에서 모니터링할 수 있도록 `notificationQueue` 컬렉션이 동기화 대상에 추가되었습니다.

**동기화된 스프레드시트**: [Firebase 데이터 동기화](https://docs.google.com/spreadsheets/d/1Klpsu6doKXqUxdGxvsDLMIyZ1RIpoysqtD6MCQ5fiR0/edit?gid=618809908#gid=618809908)

**notificationQueue 시트 구조**:
- `id`: 알림 ID
- `type`: 알림 타입 (`clinic_notification` 또는 `guardian_notification`)
- `clinicId`: 병원 ID (병원 알림인 경우)
- `userId`: 사용자 ID (보호자 알림인 경우)
- `title`: 알림 제목
- `body`: 알림 내용
- `data`: 추가 데이터 (JSON)
- `tokens`: FCM 토큰 배열 (병원 알림인 경우)
- `token`: FCM 토큰 (보호자 알림인 경우)
- `createdAt`: 생성 시간
- `sent`: 전송 완료 여부

### 스프레드시트에서 모니터링
1. **알림 생성 확인**: 새로운 예약이나 진료 완료 시 `notificationQueue` 시트에 새 행이 추가됨
2. **전송 상태 확인**: `sent` 컬럼으로 전송 완료 여부 확인
3. **통계 분석**: 알림 타입별, 시간별 통계 분석 가능

## 다음 단계

1. ✅ 기본 구조 구현 완료
2. ✅ Google Sheets 동기화 연계 완료
3. ⏳ VAPID 키 발급 및 설정
4. ⏳ Cloud Functions 또는 백엔드 서버에서 실제 푸시 전송 구현
5. ⏳ Service Worker 등록 확인
6. ⏳ 테스트 및 검증

