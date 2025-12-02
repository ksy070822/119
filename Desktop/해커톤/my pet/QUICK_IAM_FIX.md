# 빠른 IAM 권한 설정 (5분)

## 🚨 현재 문제
Cloud Functions 배포를 위해 IAM 권한이 필요합니다.

## ✅ 해결 방법 (가장 빠름)

### Firebase Console에서 설정

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - rain8477@gmail.com으로 로그인
   - `ai-factory-c6d58` 프로젝트 선택

2. **프로젝트 설정 열기**
   - 좌측 하단 톱니바퀴 아이콘 클릭
   - 또는 상단 프로젝트 이름 옆 ⚙️ 클릭

3. **서비스 계정 탭**
   - "서비스 계정" 탭 클릭

4. **권한 부여** (자동으로 부여되거나, 수동으로 부여)
   - Firebase가 자동으로 필요한 권한을 부여할 수도 있습니다
   - 만약 자동으로 안 되면 Google Cloud Console에서 설정

### 또는 Google Cloud Console에서

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/
   - rain8477@gmail.com으로 로그인
   - 프로젝트: `ai-factory-c6d58` 선택

2. **IAM 메뉴**
   - 좌측 메뉴: "IAM 및 관리자" → "IAM"

3. **서비스 계정 찾기 및 권한 추가**
   - 검색창에 다음 계정들 검색:
     - `service-213197152130@gcp-sa-pubsub.iam.gserviceaccount.com`
     - `213197152130-compute@developer.gserviceaccount.com`
   
   - 각각에 다음 역할 추가:
     - `Service Account Token Creator`
     - `Cloud Run Invoker`
     - `Eventarc Event Receiver`

## 🔄 권한 설정 후

권한 설정이 완료되면 (보통 몇 분 소요):

```bash
cd "/Users/may.08/Desktop/해커톤/my pet"
npx firebase-tools deploy --only functions
```

## 💡 팁

Firebase Console에서 "Cloud Functions" 메뉴로 가면 자동으로 필요한 권한을 부여하는 옵션이 있을 수 있습니다.

권한 설정 완료되면 알려주세요!

