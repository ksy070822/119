# Firebase IAM 권한 설정 가이드

## 현재 상황
Cloud Functions 배포를 위해 IAM 권한이 필요합니다.

## 해결 방법

### 방법 1: Firebase Console에서 설정 (권장)

1. Firebase Console 접속: https://console.firebase.google.com/
2. `ai-factory-c6d58` 프로젝트 선택
3. 좌측 메뉴에서 **"프로젝트 설정"** (톱니바퀴 아이콘) 클릭
4. **"서비스 계정"** 탭 클릭
5. **"Cloud Functions 서비스 계정"** 섹션에서:
   - `service-213197152130@gcp-sa-pubsub.iam.gserviceaccount.com`에 `Service Account Token Creator` 역할 부여
   - `213197152130-compute@developer.gserviceaccount.com`에 `Cloud Run Invoker` 및 `Eventarc Event Receiver` 역할 부여

### 방법 2: Google Cloud Console에서 설정

1. Google Cloud Console 접속: https://console.cloud.google.com/
2. 프로젝트 선택: `ai-factory-c6d58`
3. **IAM 및 관리자** → **IAM** 메뉴
4. 다음 서비스 계정에 권한 추가:
   - `service-213197152130@gcp-sa-pubsub.iam.gserviceaccount.com`
     - 역할: `Service Account Token Creator`
   - `213197152130-compute@developer.gserviceaccount.com`
     - 역할: `Cloud Run Invoker`
     - 역할: `Eventarc Event Receiver`

### 방법 3: gcloud 명령어 (rain8477@gmail.com으로 로그인 필요)

```bash
# gcloud 로그인
gcloud auth login

# rain8477@gmail.com 계정 선택

# 권한 부여
gcloud projects add-iam-policy-binding ai-factory-c6d58 \
  --member=serviceAccount:service-213197152130@gcp-sa-pubsub.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountTokenCreator

gcloud projects add-iam-policy-binding ai-factory-c6d58 \
  --member=serviceAccount:213197152130-compute@developer.gserviceaccount.com \
  --role=roles/run.invoker

gcloud projects add-iam-policy-binding ai-factory-c6d58 \
  --member=serviceAccount:213197152130-compute@developer.gserviceaccount.com \
  --role=roles/eventarc.eventReceiver
```

## 권한 설정 후

권한 설정이 완료되면 다시 배포를 시도하세요:

```bash
cd "/Users/may.08/Desktop/해커톤/my pet"
npx firebase-tools deploy --only functions
```

## 빠른 체크리스트

- [ ] Firebase Console 또는 Google Cloud Console 접속
- [ ] IAM 권한 설정
- [ ] 배포 재시도
- [ ] 배포 완료 확인

