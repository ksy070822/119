/**
 * 테스트 데이터 시드 유틸리티
 * 브라우저 콘솔에서 실행 가능
 *
 * 사용법:
 * 1. 앱에서 테스트 계정으로 로그인
 * 2. 브라우저 개발자 도구 콘솔 열기 (F12)
 * 3. window.seedTestData() 입력 후 실행
 */
import { db } from '../lib/firebase';
import {
  collection, doc, setDoc, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';

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
  '환경 개선 및 보조제 처방'
];

// 유틸리티 함수
function getRandomDateInLastMonth() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime());
  return new Date(randomTime);
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 보호자 데이터 시드
export async function seedGuardianData(userId, userEmail) {
  console.log('📦 보호자 데이터 생성 중...');

  // 사용자 정보
  await setDoc(doc(db, 'users', userId), {
    email: userEmail,
    displayName: '홍길동(보호자)',
    userMode: 'guardian',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 반려동물 2마리
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
      userId,
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
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  const petIds = [];
  for (const pet of pets) {
    const ref = await addDoc(collection(db, 'pets'), pet);
    petIds.push(ref.id);
    console.log(`  ✅ ${pet.name} 추가됨`);
  }

  // AI 진단 기록
  for (let i = 0; i < petIds.length; i++) {
    for (let j = 0; j < 2; j++) {
      await addDoc(collection(db, 'diagnoses'), {
        petId: petIds[i],
        userId,
        petName: pets[i].name,
        symptoms: [randomChoice(symptoms), randomChoice(symptoms)],
        aiDiagnosis: {
          possibleConditions: [
            { name: randomChoice(diagnoses), probability: randomInt(60, 90) },
            { name: randomChoice(diagnoses), probability: randomInt(20, 50) }
          ],
          severity: randomChoice(['낮음', '중간', '높음']),
          recommendation: '전문 수의사의 진찰을 권장합니다.',
          urgency: randomChoice(['일반', '주의', '긴급'])
        },
        createdAt: Timestamp.fromDate(getRandomDateInLastMonth())
      });
    }
  }
  console.log('  ✅ AI 진단 기록 4개 추가됨');

  // 일일 케어 로그
  for (const petId of petIds) {
    for (let d = 0; d < 7; d++) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - d);
      const dateStr = logDate.toISOString().split('T')[0];

      await setDoc(doc(db, 'dailyLogs', `${petId}_${dateStr}`), {
        petId,
        date: dateStr,
        feeding: { morning: true, evening: true, amount: randomChoice(['적음', '보통', '많음']) },
        walk: { done: Math.random() > 0.3, duration: randomInt(15, 45) },
        health: { condition: randomChoice(['좋음', '보통']), notes: '' },
        updatedAt: serverTimestamp()
      });
    }
  }
  console.log('  ✅ 케어 로그 14개 추가됨');

  console.log('✨ 보호자 데이터 생성 완료!');
  return { petIds, pets };
}

// 병원 데이터 시드
export async function seedClinicData(userId, userEmail) {
  console.log('🏥 병원 데이터 생성 중...');

  // 병원 정보
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
    services: ['일반진료', '예방접종', '수술', '건강검진'],
    verified: true,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  const clinicId = clinicRef.id;
  console.log(`  ✅ 병원 생성: ${clinicId}`);

  // 스태프 등록
  await addDoc(collection(db, 'clinicStaff'), {
    clinicId,
    userId,
    role: 'director',
    name: '김수의사',
    position: '원장',
    isActive: true,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 사용자 정보 업데이트
  await setDoc(doc(db, 'users', userId), {
    email: userEmail,
    displayName: '행복동물병원',
    userMode: 'clinic',
    defaultClinicId: clinicId,
    roles: [{ clinicId, role: 'director' }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 가상 환자 데이터
  const ownerNames = ['김철수', '이영희', '박민수', '정수진', '최동현', '강지영', '윤서준', '장미경', '조현우', '임수빈'];
  const patientPets = [];

  for (let i = 0; i < 10; i++) {
    const numPets = randomInt(1, 2);
    for (let j = 0; j < numPets; j++) {
      const isdog = Math.random() > 0.4;
      patientPets.push({
        id: `pet_${i}_${j}`,
        ownerId: `owner_${i}`,
        ownerName: ownerNames[i],
        name: isdog ? randomChoice(petNames.dog) : randomChoice(petNames.cat),
        species: isdog ? 'dog' : 'cat',
        breed: isdog ? randomChoice(['골든리트리버', '시바견', '말티즈']) : randomChoice(['코리안숏헤어', '러시안블루']),
        age: randomInt(1, 10),
        weight: isdog ? randomInt(5, 25) : randomInt(3, 6)
      });
    }
  }

  // 예약 50개
  const bookings = [];
  for (let i = 0; i < 50; i++) {
    const pet = patientPets[i % patientPets.length];
    const bookingDate = getRandomDateInLastMonth();
    const status = i < 40 ? 'completed' : (i < 45 ? 'pending' : 'cancelled');

    const ref = await addDoc(collection(db, 'bookings'), {
      clinicId,
      petId: pet.id,
      petName: pet.name,
      petSpecies: pet.species,
      ownerName: pet.ownerName,
      ownerId: pet.ownerId,
      date: bookingDate.toISOString().split('T')[0],
      time: `${randomInt(9, 17)}:${randomChoice(['00', '30'])}`,
      symptoms: [randomChoice(symptoms)],
      status,
      createdAt: Timestamp.fromDate(bookingDate),
      updatedAt: Timestamp.fromDate(bookingDate)
    });
    bookings.push({ id: ref.id, pet, date: bookingDate, status });
  }
  console.log('  ✅ 예약 50개 추가됨');

  // 진료 결과
  let resultCount = 0;
  for (const booking of bookings.filter(b => b.status === 'completed')) {
    await addDoc(collection(db, 'clinicResults'), {
      clinicId,
      bookingId: booking.id,
      petId: booking.pet.id,
      petName: booking.pet.name,
      ownerName: booking.pet.ownerName,
      visitDate: booking.date.toISOString().split('T')[0],
      chiefComplaint: randomChoice(symptoms),
      diagnosis: randomChoice(diagnoses),
      treatment: randomChoice(treatments),
      prescription: [{
        name: randomChoice(['아목시실린', '메트로니다졸', '프레드니솔론']),
        dosage: `${randomInt(1, 3)}정`,
        frequency: '하루 2회',
        duration: `${randomInt(3, 14)}일`
      }],
      veterinarian: '김수의사',
      createdAt: Timestamp.fromDate(booking.date)
    });
    resultCount++;
  }
  console.log(`  ✅ 진료 결과 ${resultCount}개 추가됨`);

  // 환자 등록
  for (const pet of patientPets.slice(0, 10)) {
    await addDoc(collection(db, 'clinicPatients'), {
      clinicId,
      petId: pet.id,
      petName: pet.name,
      petSpecies: pet.species,
      petBreed: pet.breed,
      ownerName: pet.ownerName,
      ownerPhone: `010-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
      isActive: true,
      createdAt: serverTimestamp()
    });
  }
  console.log('  ✅ 환자 10마리 등록됨');

  console.log('✨ 병원 데이터 생성 완료!');
  return { clinicId };
}

// 전역 함수로 노출 (브라우저 콘솔에서 접근 가능)
if (typeof window !== 'undefined') {
  window.seedGuardianData = seedGuardianData;
  window.seedClinicData = seedClinicData;
}

export default { seedGuardianData, seedClinicData };
