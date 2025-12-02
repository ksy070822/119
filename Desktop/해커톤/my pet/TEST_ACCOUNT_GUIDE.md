# 테스트 계정 생성 방법

이 가이드는 데모/발표용 테스트 계정을 생성하고 시드 데이터를 추가하는 방법을 설명합니다.

## 📋 목차

1. [Firebase Console에서 계정 생성](#방법-1-firebase-console에서-직접-생성-권장)
2. [Node.js 스크립트로 시드 데이터 생성](#방법-1-nodejs-스크립트-사용)
3. [브라우저 콘솔에서 시드 데이터 생성](#방법-2-앱에서-가입-후-브라우저-콘솔-사용)

---

## 방법 1: Firebase Console에서 직접 생성 (권장)

### 1단계: Firebase Console에서 계정 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com 접속
   - 프로젝트 선택: `ai-factory-c6d58`

2. **Authentication > Users 탭 이동**

3. **"Add user" 버튼 클릭 후 아래 계정 생성**

   | 계정 유형 | 이메일 | 비밀번호 |
   |----------|--------|----------|
   | 보호자 | `guardian.test@mypet.com` | `test1234!` |
   | 병원 | `clinic.test@mypet.com` | `test1234!` |

4. **생성된 계정의 User UID 복사**
   - 각 계정의 UID를 복사해두세요

### 2단계: Node.js 스크립트로 시드 데이터 생성

터미널에서 실행:

```bash
cd "/Users/may.08/Desktop/해커톤/my pet"
node scripts/seedTestData.js <보호자UID> <병원UID>
```

**예시:**
```bash
node scripts/seedTestData.js abc123def456 xyz789uvw012
```

**각각 따로 실행하려면:**
```bash
# 보호자만
node scripts/seedTestData.js --guardian <보호자UID>

# 병원만
node scripts/seedTestData.js --clinic <병원UID>
```

---

## 방법 2: 앱에서 가입 후 브라우저 콘솔 사용

### 1단계: 앱에서 회원가입

1. 앱 실행 후 회원가입 화면에서:
   - **보호자 계정**: `guardian.test@mypet.com` / `test1234!`
   - **병원 계정**: `clinic.test@mypet.com` / `test1234!`

2. 로그인 완료

### 2단계: 브라우저 콘솔에서 시드 데이터 생성

1. **F12** 키를 눌러 개발자 도구 열기
2. **Console** 탭 선택
3. 아래 명령 실행:

#### 보호자 모드인 경우:
```javascript
const user = window.auth.currentUser;
await window.seedGuardianData(user.uid, user.email);
```

#### 병원 모드인 경우:
```javascript
const user = window.auth.currentUser;
await window.seedClinicData(user.uid, user.email);
```

---

## 📦 시드 데이터 내용

### 보호자 계정

생성되는 데이터:

- **반려동물**: 2마리
  - 초코 (강아지, 말티즈, 3살)
  - 나비 (고양이, 페르시안, 2살)

- **AI 진단 기록**: 4개
  - 초코: 피부염, 소화불량
  - 나비: 호흡기 감염 의심, 치아 문제

- **일일 케어 로그**: 14개 (7일치)
  - 초코: 7일치 로그
  - 나비: 7일치 로그

### 병원 계정

생성되는 데이터:

- **병원명**: 행복동물병원
- **예약 기록**: 50개
  - 다양한 상태 (pending, confirmed, completed, cancelled)
  - 최근 7주간의 예약 데이터

- **진료 결과**: ~40개
  - 완료된 예약 기준으로 생성
  - 다양한 진단명과 처방

- **등록 환자**: 12마리
  - 강아지/고양이 혼합
  - 방문 이력 포함

---

## 🔧 문제 해결

### 스크립트 실행 오류

**오류**: `Cannot find module 'firebase-admin'`
```bash
# hospital-import 폴더로 이동 후 의존성 설치
cd "/Users/may.08/Desktop/해커톤/hospital-import"
npm install firebase-admin
```

**오류**: `사용자를 찾을 수 없습니다`
- Firebase Console에서 해당 UID의 사용자가 실제로 생성되었는지 확인
- UID를 정확히 복사했는지 확인

### 브라우저 콘솔 오류

**오류**: `window.auth is undefined`
- 앱이 완전히 로드된 후 실행
- 로그인 상태인지 확인

**오류**: `window.seedGuardianData is not a function`
- 앱을 새로고침 후 다시 시도
- 개발자 도구 콘솔에서 `window.seedGuardianData` 확인

---

## 📝 참고사항

- 시드 데이터는 **기존 데이터를 덮어쓰지 않습니다**
- 같은 계정으로 여러 번 실행하면 중복 데이터가 생성될 수 있습니다
- 테스트 후 데이터를 삭제하려면 Firebase Console에서 수동으로 삭제하세요

---

## 🎯 빠른 시작 체크리스트

- [ ] Firebase Console에서 테스트 계정 2개 생성
- [ ] UID 복사
- [ ] Node.js 스크립트 실행 또는 브라우저 콘솔에서 실행
- [ ] 앱에서 로그인하여 데이터 확인

---

**문의사항이 있으면 개발팀에 문의하세요!** 🚀


