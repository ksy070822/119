/**
 * 테스트 데이터 시드 스크립트 (Firestore 데이터만)
 *
 * ⚠️ 사용 전 Firebase Console에서 먼저 계정을 생성하세요:
 *    1. https://console.firebase.google.com
 *    2. Authentication > Users 탭
 *    3. "Add user" 버튼 클릭
 *    4. 아래 계정 정보로 2개 계정 생성
 *
 * 테스트 계정:
 *   - 보호자: guardian.test@mypet.com / test1234!
 *   - 병원: clinic.test@mypet.com / test1234!
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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

// ⚠️ 중요: Firebase Console에서 계정 생성 후 UID 값을 여기에 입력하세요!
// Authentication > Users에서 각 계정의 User UID를 복사하세요
const USER_IDS = {
  guardian: process.argv[2] || 'GUARDIAN_UID_HERE', // 실행 시 첫 번째 인자
  clinic: process.argv[3] || 'CLINIC_UID_HERE'       // 실행 시 두 번째 인자
};

// 한글 이름 생성 헬퍼
const petNames = {
  dog: ['바둑이', '초코', '몽이', '콩이', '뽀삐', '해피', '럭키', '달이', '복실이', '두부'],
  cat: ['나비', '야옹이', '냥이', '치즈', '모모', '루루', '코코', '미미', '레오', '망고']
};

const symptoms = [
  '식욕부진', '구토', '설사', '기침', '재채기', '눈물', '피부발진',
  '탈모', '무기력', '체중감소', '다음다뇨', '호흡곤란', '절뚝거림',
  '귀 긁기', '과도한 침흘림', '혈변', '혈뇨', '경련', '기력저하'
];

const diagnoses = [
  '위장염', '피부알레르기', '외이염', '결막염', '기관지염',
  '요로감염', '관절염', '치주질환', '식이알레르기', '스트레스성 질환',
  '감기', '변비', '비만', '심장질환', '신장질환', '당뇨병'
];

const treatments = [
  '수액 치료 및 항구토제 처방',
  '항생제 및 소염제 투여',
  '귀 세척 및 점이액 처방',
  '안약 처방 및 경과 관찰',
  '기침약 및 영양제 처방',
  '항생제 치료 및 식이요법 권장',
  '진통제 처방 및 운동 제한',
  '스케일링 및 소독',
  '특수 처방식이 권장',
  '환경 개선 및 보조제 처방',
  '해열제 및 충분한 휴식',
  '변비약 처방 및 수분 섭취 권장',
  '다이어트 식단 처방',
  '심장약 처방 및 정기 검진',
  '신장 보조제 및 저단백 식이',
  '인슐린 투여 시작'
];

// 랜덤 날짜 생성 (최근 한 달)
function getRandomDateInLastMonth() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime());
  return new Date(randomTime);
}

// 랜덤 선택 헬퍼
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 보호자 계정 데이터 생성
async function createGuardianData(userId) {
  console.log('\n📦 보호자 계정 데이터 생성 중...');

  // 1. 사용자 정보 저장
  await setDoc(doc(db, 'users', userId), {
    email: 'guardian.test@mypet.com',
    displayName: '홍길동(보호자)',
    userMode: 'guardian',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log('  ✅ 사용자 정보 저장 완료');

  // 2. 반려동물 2마리 추가 (개, 고양이)
  const pets = [
    {
      name: '초코',
      species: 'dog',
      breed: '골든리트리버',
      age: 3,
      weight: 28,
      gender: '수컷',
      neutered: true,
      birthday: '2021-03-15',
      photoUrl: null,
      notes: '활발하고 식욕 왕성함. 산책을 좋아함.',
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: '나비',
      species: 'cat',
      breed: '코리안숏헤어',
      age: 2,
      weight: 4,
      gender: '암컷',
      neutered: true,
      birthday: '2022-08-20',
      photoUrl: null,
      notes: '차분한 성격. 실내 생활.',
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  const petIds = [];
  for (const pet of pets) {
    const petRef = await addDoc(collection(db, 'pets'), pet);
    petIds.push(petRef.id);
    console.log(`  ✅ 반려동물 추가: ${pet.name} (${pet.species === 'dog' ? '강아지' : '고양이'})`);
  }

  // 3. 각 반려동물에 대한 AI 진단 기록 추가 (각 2개씩)
  for (let i = 0; i < petIds.length; i++) {
    for (let j = 0; j < 2; j++) {
      const symptom = randomChoice(symptoms);
      const diagnosis = randomChoice(diagnoses);
      const diagDate = getRandomDateInLastMonth();

      await addDoc(collection(db, 'diagnoses'), {
        petId: petIds[i],
        userId: userId,
        petName: pets[i].name,
        symptoms: [symptom, randomChoice(symptoms)],
        aiDiagnosis: {
          possibleConditions: [
            { name: diagnosis, probability: randomInt(60, 90) },
            { name: randomChoice(diagnoses), probability: randomInt(20, 50) }
          ],
          severity: randomChoice(['낮음', '중간', '높음']),
          recommendation: '전문 수의사의 진찰을 권장합니다.',
          urgency: randomChoice(['일반', '주의', '긴급'])
        },
        createdAt: Timestamp.fromDate(diagDate)
      });
    }
  }
  console.log('  ✅ AI 진단 기록 추가 완료 (4개)');

  // 4. 일일 케어 로그 추가 (최근 7일)
  for (const petId of petIds) {
    for (let d = 0; d < 7; d++) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - d);
      const dateStr = logDate.toISOString().split('T')[0];

      await setDoc(doc(db, 'dailyLogs', `${petId}_${dateStr}`), {
        petId: petId,
        date: dateStr,
        feeding: {
          morning: true,
          evening: true,
          amount: randomChoice(['적음', '보통', '많음'])
        },
        walk: {
          done: Math.random() > 0.3,
          duration: randomInt(15, 45)
        },
        health: {
          condition: randomChoice(['좋음', '보통', '나쁨']),
          notes: ''
        },
        medication: {
          given: false,
          name: ''
        },
        updatedAt: serverTimestamp()
      });
    }
  }
  console.log('  ✅ 일일 케어 로그 추가 완료 (14개)');

  return { petIds, pets };
}

// 병원 계정 데이터 생성
async function createClinicData(userId) {
  console.log('\n🏥 병원 계정 데이터 생성 중...');

  // 1. 병원 정보 생성
  const clinicRef = await addDoc(collection(db, 'clinics'), {
    name: '행복동물병원',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-123-4567',
    licenseNumber: 'VET-2024-001234',
    businessHours: {
      weekday: '09:00 - 18:00',
      saturday: '09:00 - 13:00',
      sunday: '휴진'
    },
    services: ['일반진료', '예방접종', '수술', '건강검진', '응급진료'],
    verified: true,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  const clinicId = clinicRef.id;
  console.log(`  ✅ 병원 정보 생성: ${clinicId}`);

  // 2. 병원 스태프 등록
  await addDoc(collection(db, 'clinicStaff'), {
    clinicId: clinicId,
    userId: userId,
    role: 'director',
    name: '김수의사',
    position: '원장',
    isActive: true,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log('  ✅ 병원 스태프 등록 완료');

  // 3. 사용자 정보 저장 (병원 모드)
  await setDoc(doc(db, 'users', userId), {
    email: 'clinic.test@mypet.com',
    displayName: '행복동물병원',
    userMode: 'clinic',
    defaultClinicId: clinicId,
    roles: [{ clinicId: clinicId, role: 'director' }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log('  ✅ 사용자 정보 저장 완료');

  // 4. 가상의 환자(보호자+반려동물) 데이터 생성
  const patientPets = [];

  const ownerNames = [
    '김철수', '이영희', '박민수', '정수진', '최동현',
    '강지영', '윤서준', '장미경', '조현우', '임수빈',
    '한지민', '서동욱', '오세현', '권나영', '신정훈',
    '황미선', '문재영', '배수지', '노진우', '전소연'
  ];

  // 각 보호자당 1-2마리 반려동물
  for (let i = 0; i < 20; i++) {
    const ownerId = `patient_owner_${i}`;
    const ownerName = ownerNames[i];
    const numPets = randomInt(1, 2);

    for (let j = 0; j < numPets; j++) {
      const isdog = Math.random() > 0.4;
      const petId = `patient_pet_${i}_${j}`;
      patientPets.push({
        id: petId,
        ownerId: ownerId,
        ownerName: ownerName,
        name: isdog ? randomChoice(petNames.dog) : randomChoice(petNames.cat),
        species: isdog ? 'dog' : 'cat',
        breed: isdog ? randomChoice(['골든리트리버', '시바견', '말티즈', '푸들', '비숑']) :
                       randomChoice(['코리안숏헤어', '러시안블루', '페르시안', '스코티시폴드', '브리티시숏헤어']),
        age: randomInt(1, 12),
        weight: isdog ? randomInt(3, 30) : randomInt(2, 7)
      });
    }
  }
  console.log(`  ✅ 가상 환자 데이터 생성: 보호자 20명, 반려동물 ${patientPets.length}마리`);

  // 5. 예약(bookings) 50개 생성
  const bookings = [];
  for (let i = 0; i < 50; i++) {
    const pet = patientPets[i % patientPets.length];
    const bookingDate = getRandomDateInLastMonth();
    const status = i < 40 ? 'completed' : (i < 45 ? 'pending' : 'cancelled');

    const bookingRef = await addDoc(collection(db, 'bookings'), {
      clinicId: clinicId,
      petId: pet.id,
      petName: pet.name,
      petSpecies: pet.species,
      ownerName: pet.ownerName,
      ownerId: pet.ownerId,
      date: bookingDate.toISOString().split('T')[0],
      time: `${randomInt(9, 17)}:${randomChoice(['00', '30'])}`,
      symptoms: [randomChoice(symptoms)],
      status: status,
      notes: status === 'cancelled' ? '보호자 요청으로 취소' : '',
      createdAt: Timestamp.fromDate(bookingDate),
      updatedAt: Timestamp.fromDate(bookingDate)
    });

    bookings.push({
      id: bookingRef.id,
      pet: pet,
      date: bookingDate,
      status: status
    });
  }
  console.log(`  ✅ 예약 데이터 생성: ${bookings.length}개`);

  // 6. 진료 결과(clinicResults) 생성 - 완료된 예약에 대해서만
  const completedBookings = bookings.filter(b => b.status === 'completed');
  let resultCount = 0;

  for (const booking of completedBookings) {
    const symptom = randomChoice(symptoms);
    const diagnosis = randomChoice(diagnoses);
    const treatment = randomChoice(treatments);

    await addDoc(collection(db, 'clinicResults'), {
      clinicId: clinicId,
      bookingId: booking.id,
      petId: booking.pet.id,
      petName: booking.pet.name,
      ownerName: booking.pet.ownerName,
      visitDate: booking.date.toISOString().split('T')[0],
      chiefComplaint: symptom,
      diagnosis: diagnosis,
      treatment: treatment,
      prescription: [
        {
          name: randomChoice(['아목시실린', '메트로니다졸', '프레드니솔론', '세파렉신']),
          dosage: `${randomInt(1, 3)}정`,
          frequency: '하루 2회',
          duration: `${randomInt(3, 14)}일`
        }
      ],
      nextVisit: Math.random() > 0.5 ? {
        recommended: true,
        date: new Date(booking.date.getTime() + randomInt(7, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: '경과 관찰'
      } : { recommended: false },
      notes: '',
      veterinarian: '김수의사',
      createdAt: Timestamp.fromDate(booking.date)
    });
    resultCount++;
  }
  console.log(`  ✅ 진료 결과 생성: ${resultCount}개`);

  // 7. 병원 환자 등록(clinicPatients)
  for (const pet of patientPets.slice(0, 15)) {
    await addDoc(collection(db, 'clinicPatients'), {
      clinicId: clinicId,
      petId: pet.id,
      petName: pet.name,
      petSpecies: pet.species,
      petBreed: pet.breed,
      petAge: pet.age,
      petWeight: pet.weight,
      ownerId: pet.ownerId,
      ownerName: pet.ownerName,
      ownerPhone: `010-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
      firstVisit: getRandomDateInLastMonth().toISOString().split('T')[0],
      notes: '',
      isActive: true,
      createdAt: serverTimestamp()
    });
  }
  console.log('  ✅ 병원 환자 등록: 15마리');

  return { clinicId, bookingsCount: bookings.length, resultsCount: resultCount };
}

// 메인 실행
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 테스트 데이터 시드 스크립트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // UID 확인
  if (USER_IDS.guardian === 'GUARDIAN_UID_HERE' || USER_IDS.clinic === 'CLINIC_UID_HERE') {
    console.log('⚠️  사용법:');
    console.log('   node scripts/seedTestData.js <보호자UID> <병원UID>\n');
    console.log('📋 Firebase Console에서 먼저 계정을 생성하세요:');
    console.log('   1. https://console.firebase.google.com 접속');
    console.log('   2. Authentication > Users 탭');
    console.log('   3. "Add user" 버튼 클릭');
    console.log('   4. 아래 정보로 2개 계정 생성:\n');
    console.log('   보호자 계정:');
    console.log('     이메일: guardian.test@mypet.com');
    console.log('     비밀번호: test1234!\n');
    console.log('   병원 계정:');
    console.log('     이메일: clinic.test@mypet.com');
    console.log('     비밀번호: test1234!\n');
    console.log('   5. 생성된 계정의 User UID를 복사');
    console.log('   6. 아래 명령어 실행:\n');
    console.log('   node scripts/seedTestData.js <보호자UID> <병원UID>');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  }

  console.log('📌 입력된 UID:');
  console.log(`   보호자: ${USER_IDS.guardian}`);
  console.log(`   병원: ${USER_IDS.clinic}\n`);

  try {
    // 1. 보호자 데이터 생성
    console.log('👤 보호자 테스트 데이터 생성 중...');
    const guardianData = await createGuardianData(USER_IDS.guardian);

    // 2. 병원 데이터 생성
    console.log('\n👨‍⚕️ 병원 테스트 데이터 생성 중...');
    const clinicData = await createClinicData(USER_IDS.clinic);

    // 결과 출력
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ 테스트 데이터 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 보호자 계정 (guardian.test@mypet.com):');
    console.log(`   반려동물: ${guardianData.pets.map(p => `${p.name}(${p.species === 'dog' ? '강아지' : '고양이'})`).join(', ')}`);
    console.log('   AI 진단 기록: 4개');
    console.log('   일일 케어 로그: 14개');

    console.log('\n📋 병원 계정 (clinic.test@mypet.com):');
    console.log(`   병원 ID: ${clinicData.clinicId}`);
    console.log(`   예약 기록: ${clinicData.bookingsCount}개`);
    console.log(`   진료 결과: ${clinicData.resultsCount}개`);
    console.log('   등록 환자: 15마리');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 이제 앱에서 테스트 계정으로 로그인할 수 있습니다!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n💥 오류 발생:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
