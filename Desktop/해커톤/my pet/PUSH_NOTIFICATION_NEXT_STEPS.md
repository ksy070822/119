# 푸시 알림 다음 단계 가이드

## ✅ 현재 완료된 것

1. ✅ **기본 코드 구조**: 모든 푸시 알림 관련 코드 작성 완료
2. ✅ **알림 트리거**: 예약 생성/진료 완료 시 알림 큐에 저장
3. ✅ **Google Sheets 연계**: `notificationQueue` 컬렉션이 스프레드시트에 동기화됨
4. ✅ **Service Worker**: 등록 코드 추가 완료

## ❌ 아직 안 된 것 (작동하려면 필수!)

### 1. VAPID 키 발급 및 설정 ✅ 완료!

**현재 상태**: ✅ VAPID 키 설정 완료

**완료된 작업**:
- VAPID 키가 `pushNotificationService.js`에 설정되었습니다
- 이제 앱에서 푸시 알림 토큰을 발급받을 수 있습니다

### 2. 실제 푸시 전송 구현 (필수!)

**현재 상태**: 알림 데이터만 `notificationQueue`에 저장됨. 실제 푸시는 전송 안 됨.

**해야 할 일**: Cloud Functions 또는 백엔드 서버에서 실제 푸시 전송 구현

#### 옵션 A: Cloud Functions 사용 (권장, 가장 간단)

**1단계: Functions 폴더 생성**
```bash
cd "my pet"
firebase init functions
# 또는
mkdir functions
cd functions
npm init -y
npm install firebase-admin firebase-functions
```

**2단계: functions/index.js 파일 생성**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document('notificationQueue/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    try {
      if (notification.type === 'clinic_notification') {
        // 병원 스태프들에게 전송
        const messages = notification.tokens.map(token => ({
          token,
          notification: {
            title: notification.title,
            body: notification.body
          },
          data: notification.data || {}
        }));
        
        if (messages.length > 0) {
          const response = await admin.messaging().sendAll(messages);
          console.log(`✅ ${response.successCount}개 알림 전송 성공`);
        }
      } else if (notification.type === 'guardian_notification') {
        // 보호자에게 전송
        await admin.messaging().send({
          token: notification.token,
          notification: {
            title: notification.title,
            body: notification.body
          },
          data: notification.data || {}
        });
        console.log('✅ 보호자 알림 전송 성공');
      }
      
      // 전송 완료 표시
      await snap.ref.update({ sent: true, sentAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (error) {
      console.error('❌ 푸시 알림 전송 실패:', error);
      await snap.ref.update({ 
        sent: false, 
        error: error.message,
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
```

**3단계: Functions 배포**
```bash
firebase deploy --only functions
```

#### 옵션 B: 기존 백엔드 서버 활용

`hospital-import` 폴더의 서버에 푸시 전송 엔드포인트 추가

### 3. 테스트

**1단계: VAPID 키 설정 후**
- 앱 실행 → 로그인 → 알림 권한 허용
- 브라우저 콘솔에서 "푸시 알림 토큰 저장 완료" 메시지 확인

**2단계: 예약 생성 테스트**
- 보호자 계정으로 예약 생성
- Firestore `notificationQueue` 컬렉션 확인
- Google Sheets `notificationQueue` 시트 확인
- `sent` 컬럼이 `true`로 변경되는지 확인

**3단계: 실제 푸시 수신 확인**
- 병원 계정 로그인한 브라우저에서 알림 수신 확인

## 📋 체크리스트

- [x] **1단계**: Firebase Console에서 VAPID 키 발급 ✅
- [x] **2단계**: `pushNotificationService.js`에 VAPID 키 설정 ✅
- [x] **3단계**: Cloud Functions 푸시 전송 로직 추가 ✅
- [ ] **4단계**: Functions 배포 (`firebase deploy --only functions`)
- [ ] **5단계**: 앱에서 알림 권한 허용 및 토큰 확인
- [ ] **6단계**: 예약 생성 → 알림 수신 테스트
- [ ] **7단계**: 진료 완료 → 알림 수신 테스트

## 🚀 배포 방법

**상세 가이드는 `FUNCTIONS_DEPLOYMENT.md` 파일을 참고하세요!**

### 빠른 배포 (3단계)

```bash
# 프로젝트 루트에서 시작
cd "/Users/may.08/Desktop/해커톤/my pet"

# 1. Functions 의존성 설치
cd functions
npm install

# 2. 프로젝트 루트로 돌아가기 (firebase.json이 있는 곳)
cd ..

# 3. Functions 배포 (프로젝트 루트에서 실행)
firebase deploy --only functions
```

**중요**: `firebase deploy` 명령어는 `firebase.json` 파일이 있는 프로젝트 루트(`my pet/` 폴더)에서 실행해야 합니다!

배포가 완료되면 완전한 푸시 알림 서비스가 작동합니다!

## 🚨 중요 참고사항

1. **VAPID 키 없이는 토큰 발급 불가**: 푸시 알림이 전혀 작동하지 않음
2. **Cloud Functions 없이는 실제 푸시 전송 안 됨**: `notificationQueue`에만 저장됨
3. **HTTPS 필수**: localhost는 예외지만, 배포 환경은 HTTPS 필요
4. **브라우저 지원**: Chrome, Firefox, Edge 등 최신 브라우저만 지원

## 💡 빠른 테스트 방법 (발표용)

만약 발표 전에 빠르게 테스트하고 싶다면:

1. **VAPID 키만 설정** → 토큰 발급 확인
2. **Cloud Functions는 나중에** → 일단 `notificationQueue`에 저장되는 것만 보여주기
3. **스프레드시트에서 확인** → 알림이 큐에 쌓이는 것을 보여주기

실제 푸시는 나중에 구현해도 됩니다!

