/**
 * 포괄적인 테스트 데이터 생성 스크립트
 * 
 * 보호자 계정: guardian@test.com
 * - 개 2마리, 고양이 2마리
 * - 최근 3개월간 매일 케어 로그
 * - AI 진단 기록
 * - 접종 기록
 * - 예약 및 진료 결과
 * 
 * 병원 계정: clinic@happyvet.com
 * - 최근 3개월 + 향후 1개월 예약 기록
 * - 진료 완료 기록
 * - 보호자 계정과 연결된 데이터
 * 
 * 실행: node scripts/createComprehensiveTestData.js
 */

import admin from 'firebase-admin';
import readline from 'readline';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Admin SDK 초기화
let serviceAccount;
try {
  // 먼저 상대 경로로 시도
  const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  try {
    // hospital-import 폴더에서 시도
    const serviceAccountPath = join(__dirname, '../../hospital-import/ai-factory-c6d58-firebase-adminsdk-fbsvc-1bdd11cb90.json');
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ hospital-import 폴더의 Service Account 파일 사용');
  } catch (e2) {
    // 환경 변수에서 시도
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      throw new Error('Firebase Service Account를 찾을 수 없습니다. serviceAccountKey.json 파일을 프로젝트 루트에 배치하거나 환경 변수를 설정하세요.');
    }
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ============ 상수 정의 ============
const GUARDIAN_EMAIL = 'guardian@test.com';
const CLINIC_EMAIL = 'clinic@happyvet.com';
const CLINIC_NAME = '행복동물병원';

// 날짜 헬퍼
function getDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return admin.firestore.Timestamp.fromDate(date);
}

function getDateString(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function getFutureDate(daysAhead = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(0, 0, 0, 0);
  return admin.firestore.Timestamp.fromDate(date);
}

function getFutureDateString(daysAhead = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

// 랜덤 헬퍼
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============ 사용자 ID 조회 ============
async function getUserIds() {
  console.log('\n📋 사용자 ID 조회 중...\n');
  
  // 보호자 계정 찾기
  const guardianQuery = await db.collection('users')
    .where('email', '==', GUARDIAN_EMAIL)
    .limit(1)
    .get();
  
  if (guardianQuery.empty) {
    throw new Error(`보호자 계정을 찾을 수 없습니다: ${GUARDIAN_EMAIL}`);
  }
  const guardianDoc = guardianQuery.docs[0];
  const guardianId = guardianDoc.id;
  const guardianData = guardianDoc.data();
  
  console.log(`✅ 보호자 계정: ${guardianId} (${GUARDIAN_EMAIL})`);
  
  // 병원 계정 찾기
  const clinicQuery = await db.collection('users')
    .where('email', '==', CLINIC_EMAIL)
    .limit(1)
    .get();
  
  if (clinicQuery.empty) {
    throw new Error(`병원 계정을 찾을 수 없습니다: ${CLINIC_EMAIL}`);
  }
  const clinicDoc = clinicQuery.docs[0];
  const clinicId = clinicDoc.id;
  const clinicData = clinicDoc.data();
  
  console.log(`✅ 병원 계정: ${clinicId} (${CLINIC_EMAIL})`);
  
  // 병원 정보 찾기
  let clinicInfoId = clinicData.defaultClinicId;
  let clinicInfo = null;
  
  if (clinicInfoId) {
    const clinicInfoDoc = await db.collection('clinics').doc(clinicInfoId).get();
    if (clinicInfoDoc.exists) {
      clinicInfo = { id: clinicInfoDoc.id, ...clinicInfoDoc.data() };
      console.log(`✅ 병원 정보: ${clinicInfo.name} (${clinicInfo.id})`);
    }
  }
  
  // 병원 정보가 없으면 생성
  if (!clinicInfo) {
    const newClinicRef = await db.collection('clinics').add({
      name: CLINIC_NAME,
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      ownerUserId: clinicId,
      createdAt: getDate(90),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    await db.collection('users').doc(clinicId).update({
      defaultClinicId: newClinicRef.id
    });
    
    clinicInfo = { id: newClinicRef.id, name: CLINIC_NAME };
    console.log(`✅ 새 병원 정보 생성: ${CLINIC_NAME} (${newClinicRef.id})`);
  }
  
  // clinicStaff 확인/생성
  const staffQuery = await db.collection('clinicStaff')
    .where('clinicId', '==', clinicInfo.id)
    .where('userId', '==', clinicId)
    .limit(1)
    .get();
  
  if (staffQuery.empty) {
    await db.collection('clinicStaff').add({
      clinicId: clinicInfo.id,
      userId: clinicId,
      role: 'owner',
      isActive: true,
      createdAt: getDate(90),
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log(`✅ 병원 스태프 등록 완료`);
  } else {
    console.log(`✅ 병원 스태프 이미 등록됨`);
  }
  
  return {
    guardianId,
    clinicId,
    clinicInfoId: clinicInfo.id,
    clinicName: clinicInfo.name
  };
}

// ============ 보호자 데이터 생성 ============
async function createGuardianData(guardianId, clinicInfoId, clinicName) {
  console.log('\n\n🐾 보호자 데이터 생성 시작...\n');
  
  // 1. 반려동물 생성 (개 2마리, 고양이 2마리)
  console.log('1️⃣ 반려동물 생성 중...');
  const pets = [
    {
      userId: guardianId,
      petName: '초코',
      species: 'dog',
      breed: '말티즈',
      gender: 'male',
      birthDate: getDate(365 * 3), // 3살
      neutered: true,
      weight: 3.5,
      character: '활발하고 친근함',
      createdAt: getDate(90),
      updatedAt: FieldValue.serverTimestamp()
    },
    {
      userId: guardianId,
      petName: '루이',
      species: 'dog',
      breed: '골든리트리버',
      gender: 'male',
      birthDate: getDate(365 * 2), // 2살
      neutered: false,
      weight: 28.5,
      character: '온순하고 차분함',
      createdAt: getDate(85),
      updatedAt: FieldValue.serverTimestamp()
    },
    {
      userId: guardianId,
      petName: '나비',
      species: 'cat',
      breed: '페르시안',
      gender: 'female',
      birthDate: getDate(365 * 2.5), // 2.5살
      neutered: true,
      weight: 4.2,
      character: '조용하고 독립적',
      createdAt: getDate(80),
      updatedAt: FieldValue.serverTimestamp()
    },
    {
      userId: guardianId,
      petName: '치즈',
      species: 'cat',
      breed: '코리안숏헤어',
      gender: 'male',
      birthDate: getDate(365 * 1.5), // 1.5살
      neutered: true,
      weight: 3.8,
      character: '장난스럽고 호기심 많음',
      createdAt: getDate(75),
      updatedAt: FieldValue.serverTimestamp()
    }
  ];
  
  const petIds = [];
  for (const pet of pets) {
    const petRef = await db.collection('pets').add(pet);
    petIds.push({ id: petRef.id, ...pet });
    console.log(`   ✅ ${pet.petName} (${pet.species === 'dog' ? '개' : '고양이'}) 생성 완료`);
  }
  
  // 2. 일일 케어 로그 생성 (최근 3개월, 매일)
  console.log('\n2️⃣ 일일 케어 로그 생성 중... (최근 90일)');
  let logCount = 0;
  const activities = {
    dog: [
      { type: 'meal', time: '08:00', note: '건사료 1컵' },
      { type: 'walk', time: '10:00', note: '산책 30분' },
      { type: 'meal', time: '18:00', note: '건사료 1컵' },
      { type: 'play', time: '20:00', note: '장난감 놀이' }
    ],
    cat: [
      { type: 'meal', time: '09:00', note: '습식 사료 1캔' },
      { type: 'play', time: '15:00', note: '장난감 놀이' },
      { type: 'meal', time: '20:00', note: '습식 사료 1캔' },
      { type: 'grooming', time: '21:00', note: '털 빗기' }
    ]
  };
  
  for (let day = 0; day < 90; day++) {
    for (const pet of petIds) {
      const petActivities = activities[pet.species];
      const notes = day % 7 === 0 ? `${pet.petName} 건강 상태 양호` : null;
      
      const logId = `${pet.id}_${getDateString(day)}`;
      await db.collection('dailyLogs').doc(logId).set({
        userId: guardianId,
        petId: pet.id,
        petName: pet.petName,
        date: getDateString(day),
        activities: petActivities,
        notes: notes,
        createdAt: getDate(day),
        updatedAt: FieldValue.serverTimestamp()
      });
      logCount++;
    }
  }
  console.log(`   ✅ 케어 로그 ${logCount}개 생성 완료`);
  
  // 3. AI 진단 기록 생성
  console.log('\n3️⃣ AI 진단 기록 생성 중...');
  const diagnoses = [
    {
      userId: guardianId,
      petId: petIds[0].id,
      petName: '초코',
      diagnosis: '경미한 피부염',
      description: '가벼운 피부 염증 증상. 가려움과 발적이 관찰되며, 알레르기성 반응일 가능성.',
      emergencyLevel: 'medium',
      triageLevel: 'medium',
      actions: [
        { type: 'home_care', title: '목욕 자주 금지', description: '일주일에 1회 이하로 목욕' },
        { type: 'medication', title: '항히스타민제', description: '수의사 처방에 따라 복용' }
      ],
      symptomTags: ['가려움', '발적', '탈모'],
      createdAt: getDate(5)
    },
    {
      userId: guardianId,
      petId: petIds[0].id,
      petName: '초코',
      diagnosis: '소화불량',
      description: '구토와 설사 증상. 식이 변화로 인한 일시적인 소화불량으로 보입니다.',
      emergencyLevel: 'low',
      triageLevel: 'low',
      actions: [
        { type: 'diet', title: '식이 조절', description: '12시간 금식 후 소량씩 급여' }
      ],
      symptomTags: ['구토', '설사'],
      createdAt: getDate(10)
    },
    {
      userId: guardianId,
      petId: petIds[1].id,
      petName: '루이',
      diagnosis: '관절염 의심',
      description: '보행 시 불편함 관찰. 관절염 초기 증상일 수 있습니다.',
      emergencyLevel: 'medium',
      triageLevel: 'medium',
      actions: [
        { type: 'hospital', title: '병원 방문', description: '일주일 내 정형외과 검진 권장' }
      ],
      symptomTags: ['절뚝거림', '보행이상'],
      createdAt: getDate(15)
    },
    {
      userId: guardianId,
      petId: petIds[2].id,
      petName: '나비',
      diagnosis: '호흡기 감염 의심',
      description: '기침과 콧물 증상이 지속됩니다. 상부 호흡기 감염 가능성.',
      emergencyLevel: 'high',
      triageLevel: 'high',
      actions: [
        { type: 'hospital', title: '병원 방문', description: '24시간 내 수의사 진료 권장' }
      ],
      symptomTags: ['기침', '콧물', '호흡곤란'],
      createdAt: getDate(3)
    },
    {
      userId: guardianId,
      petId: petIds[2].id,
      petName: '나비',
      diagnosis: '치아 문제',
      description: '식욕 저하와 침 흘림 증상. 치아나 잇몸 문제일 가능성.',
      emergencyLevel: 'medium',
      triageLevel: 'medium',
      actions: [
        { type: 'hospital', title: '치과 진료', description: '일주일 내 치과 검진 권장' }
      ],
      symptomTags: ['식욕저하', '침흘림'],
      createdAt: getDate(20)
    },
    {
      userId: guardianId,
      petId: petIds[3].id,
      petName: '치즈',
      diagnosis: '비뇨기 문제 의심',
      description: '소변 배출 시 불편함 관찰. 비뇨기 감염 가능성.',
      emergencyLevel: 'high',
      triageLevel: 'high',
      actions: [
        { type: 'hospital', title: '병원 방문', description: '즉시 수의사 진료 권장' }
      ],
      symptomTags: ['소변곤란', '혈뇨'],
      createdAt: getDate(7)
    }
  ];
  
  for (const diagnosis of diagnoses) {
    await db.collection('diagnoses').add(diagnosis);
  }
  console.log(`   ✅ AI 진단 기록 ${diagnoses.length}개 생성 완료`);
  
  // 4. 접종 기록 생성
  console.log('\n4️⃣ 접종 기록 생성 중...');
  const vaccinations = [
    { petId: petIds[0].id, petName: '초코', type: '종합백신', date: getDate(60), nextDate: getDate(365) },
    { petId: petIds[0].id, petName: '초코', type: '광견병', date: getDate(30), nextDate: getDate(365) },
    { petId: petIds[1].id, petName: '루이', type: '종합백신', date: getDate(45), nextDate: getDate(365) },
    { petId: petIds[1].id, petName: '루이', type: '광견병', date: getDate(20), nextDate: getDate(365) },
    { petId: petIds[2].id, petName: '나비', type: '종합백신', date: getDate(50), nextDate: getDate(365) },
    { petId: petIds[3].id, petName: '치즈', type: '종합백신', date: getDate(40), nextDate: getDate(365) }
  ];
  
  for (const vax of vaccinations) {
    await db.collection('vaccinations').add({
      userId: guardianId,
      ...vax,
      createdAt: vax.date,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  console.log(`   ✅ 접종 기록 ${vaccinations.length}개 생성 완료`);
  
  // 5. 예약 기록 생성 (행복동물병원에 예약)
  console.log('\n5️⃣ 예약 기록 생성 중...');
  const bookingTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const bookingReasons = ['정기검진', '예방접종', '증상 진료', '수술 상담', '치과 검진'];
  
  const bookings = [];
  // 최근 3개월간 예약 (완료된 것들)
  for (let i = 0; i < 20; i++) {
    const pet = petIds[i % petIds.length];
    const daysAgo = randomInt(1, 90);
    const status = i < 15 ? 'completed' : 'cancelled';
    
    const bookingRef = await db.collection('bookings').add({
      userId: guardianId,
      petId: pet.id,
      petName: pet.petName,
      clinicId: clinicInfoId,
      clinicName: clinicName,
      animalHospitalId: clinicInfoId, // 하위 호환
      hospitalId: clinicInfoId, // 하위 호환
      date: getDateString(daysAgo),
      time: randomChoice(bookingTimes),
      status: status,
      reason: randomChoice(bookingReasons),
      symptom: randomChoice(['기침', '설사', '가려움', '식욕저하', '무기력']),
      createdAt: getDate(daysAgo + 1),
      updatedAt: getDate(daysAgo)
    });
    
    bookings.push({
      id: bookingRef.id,
      petId: pet.id,
      petName: pet.petName,
      date: getDateString(daysAgo),
      status: status
    });
  }
  console.log(`   ✅ 예약 기록 ${bookings.length}개 생성 완료`);
  
  // 6. 진료 결과 생성 (완료된 예약에 대해)
  console.log('\n6️⃣ 진료 결과 생성 중...');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const diagnosisOptions = ['피부염', '소화불량', '호흡기 감염', '치아 문제', '정상', '관절염', '비뇨기 감염'];
  const treatmentOptions = [
    '처방약 복용 및 경과 관찰',
    '항생제 투여 및 재검진',
    '수술 권장',
    '식이 조절 및 관찰',
    '정기 검진 완료'
  ];
  
  for (const booking of completedBookings) {
    const pet = petIds.find(p => p.id === booking.petId);
    await db.collection('clinicResults').add({
      userId: guardianId,
      petId: booking.petId,
      petName: booking.petName,
      clinicId: clinicInfoId,
      clinicName: clinicName,
      bookingId: booking.id,
      diagnosis: randomChoice(diagnosisOptions),
      treatment: randomChoice(treatmentOptions),
      prescription: randomChoice(['항생제', '소화제', '항히스타민제', '진통제', '없음']),
      notes: `${booking.petName}의 진료가 완료되었습니다.`,
      vetName: '김수의',
      createdAt: getDate(parseInt(booking.date.split('-')[2])),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  console.log(`   ✅ 진료 결과 ${completedBookings.length}개 생성 완료`);
  
  return { petIds, bookings };
}

// ============ 병원 데이터 생성 ============
async function createClinicData(clinicId, clinicInfoId, clinicName, guardianId, guardianPets) {
  console.log('\n\n🏥 병원 데이터 생성 시작...\n');
  
  // 1. 예약 기록 생성 (최근 3개월 + 향후 1개월 = 총 4개월)
  console.log('1️⃣ 예약 기록 생성 중... (최근 90일 + 향후 30일)');
  const bookingTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const bookingReasons = ['정기검진', '예방접종', '증상 진료', '수술 상담', '치과 검진', '재검진'];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  
  const allBookings = [];
  
  // 최근 3개월 예약 (과거)
  for (let i = 0; i < 60; i++) {
    const daysAgo = randomInt(1, 90);
    const status = i < 45 ? 'completed' : (i < 55 ? 'cancelled' : 'pending');
    
    // 보호자 계정 예약도 일부 포함
    const isGuardianBooking = i < 10 && guardianPets.length > 0;
    const userId = isGuardianBooking ? guardianId : `user_${randomInt(1000, 9999)}`;
    const pet = isGuardianBooking 
      ? guardianPets[randomInt(0, guardianPets.length - 1)]
      : { id: `pet_${randomInt(1000, 9999)}`, petName: ['뽀삐', '코코', '별이', '하늘이'][randomInt(0, 3)] };
    
    const bookingRef = await db.collection('bookings').add({
      userId: userId,
      petId: pet.id,
      petName: pet.petName,
      clinicId: clinicInfoId,
      clinicName: clinicName,
      animalHospitalId: clinicInfoId,
      hospitalId: clinicInfoId,
      date: getDateString(daysAgo),
      time: randomChoice(bookingTimes),
      status: status,
      reason: randomChoice(bookingReasons),
      symptom: randomChoice(['기침', '설사', '가려움', '식욕저하', '무기력', '호흡곤란']),
      createdAt: getDate(daysAgo + 1),
      updatedAt: getDate(daysAgo)
    });
    
    allBookings.push({
      id: bookingRef.id,
      userId: userId,
      petId: pet.id,
      petName: pet.petName,
      date: getDateString(daysAgo),
      status: status
    });
  }
  
  // 향후 1개월 예약 (미래)
  for (let i = 0; i < 30; i++) {
    const daysAhead = randomInt(1, 30);
    const status = randomChoice(['pending', 'confirmed']);
    
    // 보호자 계정 예약도 일부 포함
    const isGuardianBooking = i < 5 && guardianPets.length > 0;
    const userId = isGuardianBooking ? guardianId : `user_${randomInt(1000, 9999)}`;
    const pet = isGuardianBooking 
      ? guardianPets[randomInt(0, guardianPets.length - 1)]
      : { id: `pet_${randomInt(1000, 9999)}`, petName: ['뽀삐', '코코', '별이', '하늘이'][randomInt(0, 3)] };
    
    const bookingRef = await db.collection('bookings').add({
      userId: userId,
      petId: pet.id,
      petName: pet.petName,
      clinicId: clinicInfoId,
      clinicName: clinicName,
      animalHospitalId: clinicInfoId,
      hospitalId: clinicInfoId,
      date: getFutureDateString(daysAhead),
      time: randomChoice(bookingTimes),
      status: status,
      reason: randomChoice(bookingReasons),
      symptom: randomChoice(['정기검진', '예방접종', '증상 진료']),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    allBookings.push({
      id: bookingRef.id,
      userId: userId,
      petId: pet.id,
      petName: pet.petName,
      date: getFutureDateString(daysAhead),
      status: status
    });
  }
  
  console.log(`   ✅ 예약 기록 ${allBookings.length}개 생성 완료`);
  
  // 2. 진료 결과 생성 (완료된 예약에 대해)
  console.log('\n2️⃣ 진료 결과 생성 중...');
  const completedBookings = allBookings.filter(b => b.status === 'completed');
  const diagnosisOptions = ['피부염', '소화불량', '호흡기 감염', '치아 문제', '정상', '관절염', '비뇨기 감염', '알레르기'];
  const treatmentOptions = [
    '처방약 복용 및 경과 관찰',
    '항생제 투여 및 재검진',
    '수술 권장',
    '식이 조절 및 관찰',
    '정기 검진 완료',
    '물리치료 권장'
  ];
  
  let resultCount = 0;
  for (const booking of completedBookings) {
    // 보호자 계정 예약에 대한 진료 결과는 이미 생성되었을 수 있음
    if (booking.userId === guardianId) {
      const existingResult = await db.collection('clinicResults')
        .where('bookingId', '==', booking.id)
        .limit(1)
        .get();
      
      if (!existingResult.empty) {
        continue; // 이미 존재하면 스킵
      }
    }
    
    await db.collection('clinicResults').add({
      userId: booking.userId,
      petId: booking.petId,
      petName: booking.petName,
      clinicId: clinicInfoId,
      clinicName: clinicName,
      bookingId: booking.id,
      diagnosis: randomChoice(diagnosisOptions),
      treatment: randomChoice(treatmentOptions),
      prescription: randomChoice(['항생제', '소화제', '항히스타민제', '진통제', '없음']),
      notes: `${booking.petName}의 진료가 완료되었습니다.`,
      vetName: '김수의',
      createdAt: getDate(parseInt(booking.date.split('-')[2]) || 1),
      updatedAt: FieldValue.serverTimestamp()
    });
    resultCount++;
  }
  console.log(`   ✅ 진료 결과 ${resultCount}개 생성 완료`);
  
  return { bookings: allBookings };
}

// ============ 메인 함수 ============
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 포괄적인 테스트 데이터 생성 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // 사용자 ID 조회
    const { guardianId, clinicId, clinicInfoId, clinicName } = await getUserIds();
    
    // 기존 데이터 확인
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('\n⚠️  기존 데이터가 있을 수 있습니다. 계속하시겠습니까? (y/n): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('\n❌ 취소되었습니다.');
      process.exit(0);
    }
    
    // 보호자 데이터 생성
    const { petIds, bookings: guardianBookings } = await createGuardianData(
      guardianId,
      clinicInfoId,
      clinicName
    );
    
    // 병원 데이터 생성
    await createClinicData(
      clinicId,
      clinicInfoId,
      clinicName,
      guardianId,
      petIds
    );
    
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 테스트 데이터 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 생성된 데이터 요약:');
    console.log(`   - 반려동물: ${petIds.length}마리`);
    console.log(`   - 일일 케어 로그: 360개 (90일 × 4마리)`);
    console.log(`   - AI 진단 기록: 6개`);
    console.log(`   - 접종 기록: 6개`);
    console.log(`   - 예약 기록: ${guardianBookings.length}개 (보호자)`);
    console.log(`   - 진료 결과: ${guardianBookings.filter(b => b.status === 'completed').length}개 (보호자)`);
    console.log(`   - 병원 예약: 90개 (과거 60개 + 미래 30개)`);
    console.log('\n🎯 이제 테스트를 시작할 수 있습니다!\n');
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main().catch(error => {
  console.error('스크립트 실행 오류:', error);
  process.exit(1);
});

