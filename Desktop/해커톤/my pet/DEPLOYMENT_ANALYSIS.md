# 배포 문제 원인 분석 및 해결

## 🔍 문제 원인

### 1. 배포 상태
- ✅ **Functions는 이미 배포되어 있음**
- ✅ **sendPushNotification**: ACTIVE 상태
- ✅ **cleanupOldNotifications**: ACTIVE 상태

### 2. 실제 문제
배포 명령 실행 시:
- Functions 코드 변경사항이 없어서 **스킵됨** (정상)
- 하지만 **cleanup policy 설정 오류** 발생:
  ```
  Error: Functions successfully deployed but could not set up cleanup policy 
  in location us-central1.
  ```

### 3. 왜 타임아웃처럼 보였나?
- Cleanup policy 오류가 마지막에 발생하여 배포 실패로 오해
- 실제로는 배포는 성공했지만, 정리 정책만 설정되지 않음

## ✅ 해결 방법

### 1. Cleanup Policy 설정
```bash
npx firebase-tools functions:artifacts:setpolicy --project ai-factory-c6d58
```

또는 배포 시 `--force` 옵션 사용:
```bash
npx firebase-tools deploy --only functions --force
```

### 2. 코드 확인
현재 코드는 v2 API를 올바르게 사용하고 있습니다:
- `onDocumentCreated` v2 API 사용 ✅
- `event.data.ref` 사용 ✅
- `event.params.notificationId` 사용 ✅

## 🧪 Functions 작동 확인

### 1. Functions 상태 확인
```bash
npx firebase-tools functions:list --project ai-factory-c6d58
```

### 2. Functions 로그 확인
```bash
npx firebase-tools functions:log --only sendPushNotification
```

### 3. 실제 테스트
1. Firestore `notificationQueue` 컬렉션에 새 문서 생성
2. Functions 로그에서 실행 확인
3. 푸시 알림 전송 확인

## 📊 현재 상태

- ✅ Functions 배포 완료
- ✅ 코드 정상 (v2 API 올바르게 사용)
- ⚠️ Cleanup policy 미설정 (선택사항, 월간 비용에 영향)
- ⏳ 실제 작동 테스트 필요

## 🎯 다음 단계

1. **Cleanup policy 설정** (선택사항)
2. **실제 푸시 알림 테스트**
3. **Functions 로그 모니터링**

**결론: 배포는 정상적으로 완료되었습니다. Cleanup policy만 설정하면 됩니다.**

