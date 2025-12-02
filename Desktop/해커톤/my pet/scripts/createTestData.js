// 테스트 데이터 생성 스크립트
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAMubJk9qXmaz_V3uHiCGs0hRe6FSu9ji4",
  authDomain: "ai-factory-c6d58.firebaseapp.com",
  projectId: "ai-factory-c6d58",
  storageBucket: "ai-factory-c6d58.firebasestorage.app",
  messagingSenderId: "213197152130",
  appId: "1:213197152130:web:7c19f9c3c88bea7cc1399b",
  measurementId: "G-4D82WS9H7K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 보호자 계정 UID (회원가입 후 입력해야 함)
const GUARDIAN_UID = process.argv[2];
// 병원 직원 계정 UID (회원가입 후 입력해야 함)
const CLINIC_UID = process.argv[3];

const CLINIC_ID = 'clinicA';

// 랜덤 날짜 생성 (최근 30일)
function getRandomDateInLastMonth() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// 랜덤 시간 생성
function getRandomTime() {
  const hours = 9 + Math.floor(Math.random() * 10); // 9-18시
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// 보호자용 반려동물 데이터
const GUARDIAN_PETS = [
  {
    name: '멍멍이',
    species: 'dog',
    breed: '골든 리트리버',
    birthDate: '2020-03-15',
    sex: 'M',
    weight: 28.5,
    color: '골드',
    character: { id: 'dog_golden', emoji: '🦮', label: '골든 리트리버', color: '#DAA520' }
  },
  {
    name: '냥이',
    species: 'cat',
    breed: '코리안 숏헤어',
    birthDate: '2021-07-20',
    sex: 'F',
    weight: 3.8,
    color: '치즈',
    character: { id: 'cat_orange', emoji: '🐱', label: '치즈 고양이', color: '#FFA500' }
  }
];

// 병원용 환자 동물 데이터 (30마리)
const CLINIC_PETS = [
  { name: '바둑이', species: 'dog', breed: '믹스견', birthDate: '2019-01-10', sex: 'M', weight: 12.0 },
  { name: '초코', species: 'dog', breed: '푸들', birthDate: '2020-05-22', sex: 'F', weight: 5.2 },
  { name: '콩이', species: 'cat', breed: '페르시안', birthDate: '2021-03-15', sex: 'M', weight: 4.5 },
  { name: '뭉치', species: 'dog', breed: '웰시코기', birthDate: '2018-11-30', sex: 'M', weight: 11.5 },
  { name: '루루', species: 'cat', breed: '러시안블루', birthDate: '2020-08-14', sex: 'F', weight: 3.9 },
  { name: '맥스', species: 'dog', breed: '시바견', birthDate: '2019-06-18', sex: 'M', weight: 10.2 },
  { name: '모모', species: 'cat', breed: '샴', birthDate: '2021-02-25', sex: 'F', weight: 3.5 },
  { name: '보리', species: 'dog', breed: '비글', birthDate: '2020-09-12', sex: 'M', weight: 13.8 },
  { name: '나비', species: 'cat', breed: '벵갈', birthDate: '2019-12-05', sex: 'F', weight: 4.2 },
  { name: '구름', species: 'dog', breed: '말티즈', birthDate: '2021-04-08', sex: 'F', weight: 3.2 },
  { name: '호두', species: 'cat', breed: '스코티시폴드', birthDate: '2020-01-20', sex: 'M', weight: 5.1 },
  { name: '까망이', species: 'dog', breed: '진돗개', birthDate: '2018-07-15', sex: 'M', weight: 18.5 },
  { name: '하양이', species: 'cat', breed: '터키시앙고라', birthDate: '2021-06-30', sex: 'F', weight: 3.8 },
  { name: '복실이', species: 'dog', breed: '포메라니안', birthDate: '2020-10-22', sex: 'F', weight: 2.8 },
  { name: '점박이', species: 'cat', breed: '칼리코', birthDate: '2019-09-14', sex: 'F', weight: 4.0 },
  { name: '뽀미', species: 'dog', breed: '요크셔테리어', birthDate: '2021-01-18', sex: 'F', weight: 3.5 },
  { name: '호랑이', species: 'cat', breed: '아메리칸숏헤어', birthDate: '2020-03-25', sex: 'M', weight: 4.8 },
  { name: '두부', species: 'dog', breed: '시츄', birthDate: '2019-05-30', sex: 'M', weight: 6.2 },
  { name: '구슬', species: 'cat', breed: '메인쿤', birthDate: '2018-11-12', sex: 'F', weight: 7.5 },
  { name: '별이', species: 'dog', breed: '치와와', birthDate: '2021-08-05', sex: 'F', weight: 2.1 },
  { name: '얼룩이', species: 'cat', breed: '먼치킨', birthDate: '2020-06-18', sex: 'M', weight: 3.2 },
  { name: '누렁이', species: 'dog', breed: '리트리버', birthDate: '2019-02-14', sex: 'M', weight: 30.0 },
  { name: '삼색이', species: 'cat', breed: '코리안숏헤어', birthDate: '2021-09-22', sex: 'F', weight: 3.6 },
  { name: '복덩이', species: 'dog', breed: '불독', birthDate: '2018-12-08', sex: 'M', weight: 22.5 },
  { name: '미미', species: 'cat', breed: '노르웨이숲', birthDate: '2020-04-15', sex: 'F', weight: 5.5 },
  { name: '강아지', species: 'dog', breed: '닥스훈트', birthDate: '2021-03-20', sex: 'M', weight: 8.5 },
  { name: '고양이', species: 'cat', breed: '브리티시숏헤어', birthDate: '2019-10-30', sex: 'F', weight: 4.5 },
  { name: '짱구', species: 'dog', breed: '보더콜리', birthDate: '2020-07-12', sex: 'M', weight: 15.2 },
  { name: '유리', species: 'cat', breed: '래그돌', birthDate: '2021-05-18', sex: 'F', weight: 4.8 },
  { name: '훈이', species: 'dog', breed: '저먼셰퍼드', birthDate: '2018-09-25', sex: 'M', weight: 35.0 }
];

// 진단 증상 예시
const SYMPTOMS = [
  '설사를 계속해요',
  '기침을 자주 합니다',
  '식욕이 없어요',
  '구토를 했어요',
  '발을 절뚝거려요',
  '눈곱이 많이 껴요',
  '털이 많이 빠져요',
  '피부가 빨개졌어요',
  '귀를 긁어요',
  '숨쉬기 힘들어해요'
];

// 진단 결과 예시
const DIAGNOSES = [
  '급성 위장염 의심',
  '기관지염 증상',
  '식욕부진 (스트레스성)',
  '소화불량',
  '다리 염좌',
  '결막염',
  '계절성 탈모',
  '피부 알레르기',
  '외이염',
  '호흡기 감염'
];

async function createTestData() {
  if (!GUARDIAN_UID || !CLINIC_UID) {
    console.error('❌ 사용자 UID가 필요합니다.');
    console.log('\n사용 방법:');
    console.log('  node scripts/createTestData.js <보호자_UID> <병원직원_UID>\n');
    console.log('예시:');
    console.log('  node scripts/createTestData.js abc123 xyz789\n');
    process.exit(1);
  }

  console.log('🎲 테스트 데이터 생성 시작...\n');
  console.log(`보호자 UID: ${GUARDIAN_UID}`);
  console.log(`병원 직원 UID: ${CLINIC_UID}\n`);

  try {
    // 1. 보호자 반려동물 2마리 생성
    console.log('1️⃣ 보호자 반려동물 생성 중...');
    const guardianPetIds = [];

    for (const petData of GUARDIAN_PETS) {
      const petId = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, 'pets', petId), {
        id: petId,
        userId: GUARDIAN_UID,
        ...petData,
        createdAt: new Date().toISOString()
      });
      guardianPetIds.push(petId);
      console.log(`  ✅ ${petData.name} (${petData.species}) 생성 완료`);
    }

    // 2. 보호자 동물의 진단 기록 생성 (각 동물당 3-5개)
    console.log('\n2️⃣ 보호자 진단 기록 생성 중...');
    for (const petId of guardianPetIds) {
      const diagnosisCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < diagnosisCount; i++) {
        const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const symptomIdx = Math.floor(Math.random() * SYMPTOMS.length);
        await setDoc(doc(db, 'diagnoses', diagnosisId), {
          id: diagnosisId,
          userId: GUARDIAN_UID,
          petId: petId,
          symptom: SYMPTOMS[symptomIdx],
          diagnosis: DIAGNOSES[symptomIdx],
          triageLevel: Math.random() > 0.7 ? 'urgent' : Math.random() > 0.4 ? 'moderate' : 'normal',
          created_at: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      console.log(`  ✅ ${diagnosisCount}개 진단 기록 생성`);
    }

    // 3. 병원 환자 동물 30마리 생성
    console.log('\n3️⃣ 병원 환자 동물 생성 중...');
    const clinicPetIds = [];

    for (const petData of CLINIC_PETS) {
      const petId = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const ownerId = `owner_${Math.random().toString(36).substr(2, 9)}`;

      await setDoc(doc(db, 'pets', petId), {
        id: petId,
        userId: ownerId,
        ...petData,
        createdAt: new Date().toISOString()
      });

      // clinicPatients에도 등록
      await setDoc(doc(db, 'clinicPatients', petId), {
        id: petId,
        petId: petId,
        ownerId: ownerId,
        ownerName: `${petData.name} 보호자`,
        ownerPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        clinicId: CLINIC_ID,
        firstVisit: getRandomDateInLastMonth(),
        lastVisit: getRandomDateInLastMonth(),
        totalVisits: Math.floor(1 + Math.random() * 5),
        createdAt: new Date().toISOString()
      });

      clinicPetIds.push({ petId, ownerId, petName: petData.name, ownerName: `${petData.name} 보호자` });
    }
    console.log(`  ✅ ${CLINIC_PETS.length}마리 환자 동물 생성 완료`);

    // 4. 병원 예약 50건 생성 (최근 한 달)
    console.log('\n4️⃣ 병원 예약 50건 생성 중...');
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const triageLevels = ['normal', 'moderate', 'urgent', 'emergency'];

    for (let i = 0; i < 50; i++) {
      const randomPet = clinicPetIds[Math.floor(Math.random() * clinicPetIds.length)];
      const bookingId = `booking_${Date.now()}_${i}`;
      const date = getRandomDateInLastMonth();
      const time = getRandomTime();
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const symptomIdx = Math.floor(Math.random() * SYMPTOMS.length);

      await setDoc(doc(db, 'bookings', bookingId), {
        id: bookingId,
        userId: randomPet.ownerId,
        petId: randomPet.petId,
        petName: randomPet.petName,
        clinicId: CLINIC_ID,
        clinicName: '행복 동물병원',
        date: date,
        time: time,
        status: status,
        symptom: SYMPTOMS[symptomIdx],
        triageLevel: triageLevels[Math.floor(Math.random() * triageLevels.length)],
        createdAt: new Date(date + 'T' + time + ':00').toISOString()
      });

      // 완료된 예약은 진료 결과도 생성
      if (status === 'completed') {
        const resultId = `result_${bookingId}`;
        await setDoc(doc(db, 'clinicResults', resultId), {
          id: resultId,
          bookingId: bookingId,
          petId: randomPet.petId,
          clinicId: CLINIC_ID,
          diagnosis: DIAGNOSES[symptomIdx],
          treatment: '약 처방 및 경과 관찰',
          prescription: '진통제, 소염제',
          nextVisit: null,
          vetId: CLINIC_UID,
          vetName: '김수의',
          createdAt: new Date(date + 'T' + time + ':00').toISOString()
        });
      }
    }
    console.log('  ✅ 50건 예약 생성 완료');

    // 완료 메시지
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 테스트 데이터 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 생성된 데이터:');
    console.log(`   보호자 (${GUARDIAN_UID})`);
    console.log(`   └─ 반려동물: 2마리`);
    console.log(`   └─ 진단 기록: ${guardianPetIds.length * 4}개 (평균)`);
    console.log('');
    console.log(`   병원 (${CLINIC_ID})`);
    console.log(`   └─ 환자 동물: 30마리`);
    console.log(`   └─ 예약: 50건 (최근 한 달)`);
    console.log(`   └─ 진료 결과: ~25건 (완료된 예약)\n`);

  } catch (error) {
    console.error('\n❌ 데이터 생성 실패:', error);
  }

  process.exit(0);
}

// 실행
createTestData();
