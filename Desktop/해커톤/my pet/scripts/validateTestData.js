/**
 * 테스트 데이터 검증 스크립트
 * 생성된 데이터의 구조와 연결 관계를 검증합니다.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Admin SDK 초기화
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  try {
    const serviceAccountPath = join(__dirname, '../../hospital-import/ai-factory-c6d58-firebase-adminsdk-fbsvc-1bdd11cb90.json');
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  } catch (e2) {
    throw new Error('Firebase Service Account를 찾을 수 없습니다.');
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const GUARDIAN_EMAIL = 'guardian@test.com';
const CLINIC_EMAIL = 'clinic@happyvet.com';

async function validateData() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 테스트 데이터 검증 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 사용자 계정 확인
    console.log('1️⃣ 사용자 계정 확인...');
    const guardianQuery = await db.collection('users')
      .where('email', '==', GUARDIAN_EMAIL)
      .limit(1)
      .get();
    
    if (guardianQuery.empty) {
      throw new Error('보호자 계정을 찾을 수 없습니다.');
    }
    const guardianId = guardianQuery.docs[0].id;
    console.log(`   ✅ 보호자 계정: ${guardianId}`);

    const clinicQuery = await db.collection('users')
      .where('email', '==', CLINIC_EMAIL)
      .limit(1)
      .get();
    
    if (clinicQuery.empty) {
      throw new Error('병원 계정을 찾을 수 없습니다.');
    }
    const clinicId = clinicQuery.docs[0].id;
    const clinicData = clinicQuery.docs[0].data();
    const clinicInfoId = clinicData.defaultClinicId;
    console.log(`   ✅ 병원 계정: ${clinicId}`);
    console.log(`   ✅ 병원 정보 ID: ${clinicInfoId}`);

    // 2. 반려동물 확인
    console.log('\n2️⃣ 반려동물 확인...');
    const petsQuery = await db.collection('pets')
      .where('userId', '==', guardianId)
      .get();
    
    console.log(`   ✅ 반려동물: ${petsQuery.size}마리`);
    const petIds = petsQuery.docs.map(doc => doc.id);
    const petData = petsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    petData.forEach(pet => {
      console.log(`      - ${pet.petName} (${pet.species === 'dog' ? '개' : '고양이'})`);
    });

    // 3. 일일 케어 로그 확인
    console.log('\n3️⃣ 일일 케어 로그 확인...');
    let totalLogs = 0;
    for (const petId of petIds) {
      const logsQuery = await db.collection('dailyLogs')
        .where('petId', '==', petId)
        .get();
      totalLogs += logsQuery.size;
    }
    console.log(`   ✅ 일일 케어 로그: ${totalLogs}개`);

    // 4. AI 진단 기록 확인
    console.log('\n4️⃣ AI 진단 기록 확인...');
    const diagnosesQuery = await db.collection('diagnoses')
      .where('userId', '==', guardianId)
      .get();
    console.log(`   ✅ AI 진단 기록: ${diagnosesQuery.size}개`);

    // 5. 접종 기록 확인
    console.log('\n5️⃣ 접종 기록 확인...');
    const vaccinationsQuery = await db.collection('vaccinations')
      .where('userId', '==', guardianId)
      .get();
    console.log(`   ✅ 접종 기록: ${vaccinationsQuery.size}개`);

    // 6. 예약 기록 확인 (보호자)
    console.log('\n6️⃣ 예약 기록 확인 (보호자)...');
    const guardianBookingsQuery = await db.collection('bookings')
      .where('userId', '==', guardianId)
      .get();
    console.log(`   ✅ 보호자 예약: ${guardianBookingsQuery.size}개`);
    
    const completedBookings = guardianBookingsQuery.docs.filter(doc => doc.data().status === 'completed');
    console.log(`      - 완료된 예약: ${completedBookings.length}개`);

    // 7. 진료 결과 확인 (보호자)
    console.log('\n7️⃣ 진료 결과 확인 (보호자)...');
    const guardianResultsQuery = await db.collection('clinicResults')
      .where('userId', '==', guardianId)
      .get();
    console.log(`   ✅ 보호자 진료 결과: ${guardianResultsQuery.size}개`);

    // 8. 예약-진료 결과 연결 확인
    console.log('\n8️⃣ 예약-진료 결과 연결 확인...');
    let connectedCount = 0;
    for (const bookingDoc of completedBookings) {
      const bookingId = bookingDoc.id;
      const resultQuery = await db.collection('clinicResults')
        .where('bookingId', '==', bookingId)
        .get();
      if (!resultQuery.empty) {
        connectedCount++;
      }
    }
    console.log(`   ✅ 연결된 예약-진료 결과: ${connectedCount}/${completedBookings.length}개`);

    // 9. 병원 예약 확인
    console.log('\n9️⃣ 병원 예약 확인...');
    const clinicBookingsQuery = await db.collection('bookings')
      .where('clinicId', '==', clinicInfoId)
      .get();
    console.log(`   ✅ 병원 예약: ${clinicBookingsQuery.size}개`);
    
    const futureBookings = clinicBookingsQuery.docs.filter(doc => {
      const date = doc.data().date;
      const today = new Date().toISOString().split('T')[0];
      return date >= today;
    });
    console.log(`      - 미래 예약: ${futureBookings.length}개`);

    // 10. 병원 진료 결과 확인
    console.log('\n🔟 병원 진료 결과 확인...');
    const clinicResultsQuery = await db.collection('clinicResults')
      .where('clinicId', '==', clinicInfoId)
      .get();
    console.log(`   ✅ 병원 진료 결과: ${clinicResultsQuery.size}개`);

    // 11. 보호자-병원 연결 확인
    console.log('\n1️⃣1️⃣ 보호자-병원 연결 확인...');
    const guardianClinicBookings = clinicBookingsQuery.docs.filter(doc => doc.data().userId === guardianId);
    console.log(`   ✅ 보호자 예약이 병원에 표시됨: ${guardianClinicBookings.length}개`);

    const guardianClinicResults = clinicResultsQuery.docs.filter(doc => doc.data().userId === guardianId);
    console.log(`   ✅ 보호자 진료 결과가 병원에 표시됨: ${guardianClinicResults.length}개`);

    // 12. 데이터 구조 검증
    console.log('\n1️⃣2️⃣ 데이터 구조 검증...');
    const issues = [];

    // 반려동물 필수 필드 확인
    for (const pet of petData) {
      const requiredFields = ['petName', 'species', 'userId'];
      for (const field of requiredFields) {
        if (!pet[field]) {
          issues.push(`반려동물 ${pet.petName}: 필수 필드 누락 - ${field}`);
        }
      }
    }

    // 예약 필수 필드 확인
    for (const bookingDoc of guardianBookingsQuery.docs) {
      const booking = bookingDoc.data();
      const requiredFields = ['userId', 'petId', 'clinicId', 'date', 'time', 'status'];
      for (const field of requiredFields) {
        if (!booking[field]) {
          issues.push(`예약 ${bookingDoc.id}: 필수 필드 누락 - ${field}`);
        }
      }
    }

    // 진료 결과 필수 필드 확인
    for (const resultDoc of guardianResultsQuery.docs) {
      const result = resultDoc.data();
      const requiredFields = ['userId', 'petId', 'clinicId', 'bookingId', 'diagnosis'];
      for (const field of requiredFields) {
        if (!result[field]) {
          issues.push(`진료 결과 ${resultDoc.id}: 필수 필드 누락 - ${field}`);
        }
      }
    }

    if (issues.length === 0) {
      console.log('   ✅ 모든 데이터 구조가 올바릅니다.');
    } else {
      console.log(`   ⚠️  발견된 문제: ${issues.length}개`);
      issues.forEach(issue => console.log(`      - ${issue}`));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 데이터 검증 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 검증 오류:', error);
    process.exit(1);
  }
}

validateData();

