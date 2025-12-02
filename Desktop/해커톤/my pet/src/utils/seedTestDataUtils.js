/**
 * 테스트 계정용 시드 데이터 생성 유틸리티 (브라우저 콘솔용)
 * 
 * 사용법:
 *   F12 → Console에서:
 *   
 *   // 보호자 모드인 경우
 *   const user = window.auth.currentUser;
 *   await window.seedGuardianData(user.uid, user.email);
 * 
 *   // 병원 모드인 경우
 *   await window.seedClinicData(user.uid, user.email);
 */

import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

/**
 * 날짜 생성 헬퍼
 */
function getDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return Timestamp.fromDate(date);
}

/**
 * 보호자 계정 시드 데이터 생성
 */
export async function seedGuardianData(guardianUid, guardianEmail) {
  console.log(`\n👤 보호자 계정 데이터 생성 시작: ${guardianEmail} (${guardianUid})\n`);

  try {
    // 1. 반려동물 생성
    console.log('🐾 반려동물 생성 중...');
    
    const 초코 = {
      userId: guardianUid,
      petName: '초코',
      species: 'dog',
      breed: '말티즈',
      gender: 'male',
      birthDate: getDate(365 * 3), // 3살
      neutered: true,
      weight: 3.5,
      createdAt: getDate(30),
      updatedAt: getDate(0)
    };
    const 초코Ref = await addDoc(collection(db, 'pets'), 초코);
    const 초코Id = 초코Ref.id;
    console.log(`   ✅ 초코 생성 완료 (ID: ${초코Id})`);

    const 나비 = {
      userId: guardianUid,
      petName: '나비',
      species: 'cat',
      breed: '페르시안',
      gender: 'female',
      birthDate: getDate(365 * 2), // 2살
      neutered: true,
      weight: 4.2,
      createdAt: getDate(20),
      updatedAt: getDate(0)
    };
    const 나비Ref = await addDoc(collection(db, 'pets'), 나비);
    const 나비Id = 나비Ref.id;
    console.log(`   ✅ 나비 생성 완료 (ID: ${나비Id})`);

    // 2. AI 진단 기록 생성 (4개)
    console.log('\n🏥 AI 진단 기록 생성 중...');
    
    const diagnoses = [
      {
        userId: guardianUid,
        petId: 초코Id,
        petName: '초코',
        diagnosis: '경미한 피부염',
        description: '초코는 가벼운 피부 염증 증상을 보이고 있습니다. 가려움과 발적이 관찰되며, 알레르기성 반응일 가능성이 있습니다.',
        emergencyLevel: 'medium',
        triageLevel: 'medium',
        actions: [
          { type: 'home_care', title: '목욕 자주 금지', description: '일주일에 1회 이하로 목욕' },
          { type: 'medication', title: '항히스타민제', description: '수의사 처방에 따라 복용' },
          { type: 'monitor', title: '증상 관찰', description: '3일 내 개선되지 않으면 병원 방문' }
        ],
        symptomTags: ['가려움', '발적', '탈모'],
        createdAt: getDate(5)
      },
      {
        userId: guardianUid,
        petId: 초코Id,
        petName: '초코',
        diagnosis: '소화불량',
        description: '초코의 구토와 설사 증상이 관찰됩니다. 식이 변화나 부적절한 음식 섭취로 인한 일시적인 소화불량으로 보입니다.',
        emergencyLevel: 'low',
        triageLevel: 'low',
        actions: [
          { type: 'diet', title: '식이 조절', description: '12시간 금식 후 소량씩 급여' },
          { type: 'hydration', title: '수분 섭취', description: '충분한 물 공급' }
        ],
        symptomTags: ['구토', '설사'],
        createdAt: getDate(10)
      },
      {
        userId: guardianUid,
        petId: 나비Id,
        petName: '나비',
        diagnosis: '호흡기 감염 의심',
        description: '나비의 기침과 콧물 증상이 지속되고 있습니다. 상부 호흡기 감염 가능성이 있어 수의사 진료가 필요합니다.',
        emergencyLevel: 'high',
        triageLevel: 'high',
        actions: [
          { type: 'hospital', title: '병원 방문', description: '24시간 내 수의사 진료 권장' },
          { type: 'monitor', title: '호흡 상태 관찰', description: '호흡 곤란 시 즉시 응급실' }
        ],
        symptomTags: ['기침', '콧물', '호흡곤란'],
        createdAt: getDate(3)
      },
      {
        userId: guardianUid,
        petId: 나비Id,
        petName: '나비',
        diagnosis: '치아 문제',
        description: '나비의 식욕 저하와 침 흘림 증상이 관찰됩니다. 치아나 잇몸 문제일 가능성이 있습니다.',
        emergencyLevel: 'medium',
        triageLevel: 'medium',
        actions: [
          { type: 'hospital', title: '치과 진료', description: '일주일 내 치과 검진 권장' },
          { type: 'diet', title: '부드러운 음식', description: '경질 사료 대신 습식 사료 제공' }
        ],
        symptomTags: ['식욕저하', '침흘림'],
        createdAt: getDate(15)
      }
    ];

    for (const diagnosis of diagnoses) {
      await addDoc(collection(db, 'diagnoses'), diagnosis);
    }
    console.log(`   ✅ 진단 기록 4개 생성 완료`);

    // 3. 일일 케어 로그 생성 (14개, 7일치)
    console.log('\n📝 일일 케어 로그 생성 중...');
    
    const careLogs = [];
    for (let day = 0; day < 7; day++) {
      // 초코 로그
      careLogs.push({
        userId: guardianUid,
        petId: 초코Id,
        petName: '초코',
        date: getDate(day),
        activities: [
          { type: 'meal', time: '08:00', note: '건사료 1컵' },
          { type: 'walk', time: '10:00', note: '산책 30분' },
          { type: 'meal', time: '18:00', note: '건사료 1컵' }
        ],
        notes: day === 0 ? '피부 가려움 관찰됨' : null,
        createdAt: getDate(day)
      });

      // 나비 로그
      careLogs.push({
        userId: guardianUid,
        petId: 나비Id,
        petName: '나비',
        date: getDate(day),
        activities: [
          { type: 'meal', time: '09:00', note: '습식 사료 1캔' },
          { type: 'play', time: '15:00', note: '장난감 놀이' },
          { type: 'meal', time: '20:00', note: '습식 사료 1캔' }
        ],
        notes: day === 2 ? '기침 증상 지속' : null,
        createdAt: getDate(day)
      });
    }

    for (const log of careLogs) {
      await addDoc(collection(db, 'dailyLogs'), log);
    }
    console.log(`   ✅ 케어 로그 14개 생성 완료`);

    console.log('\n✅ 보호자 계정 데이터 생성 완료!');
    return {
      success: true,
      pets: [초코Id, 나비Id],
      diagnoses: 4,
      careLogs: 14
    };
  } catch (error) {
    console.error('❌ 보호자 데이터 생성 오류:', error);
    throw error;
  }
}

/**
 * 병원 계정 시드 데이터 생성
 */
export async function seedClinicData(clinicUid, clinicEmail) {
  console.log(`\n🏥 병원 계정 데이터 생성 시작: ${clinicEmail} (${clinicUid})\n`);

  try {
    // 1. 병원 정보 확인/생성
    console.log('🏥 병원 정보 확인 중...');
    
    const userDoc = await getDoc(doc(db, 'users', clinicUid));
    let clinicId = null;
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      clinicId = userData.defaultClinicId;
      
      if (clinicId) {
        const clinicDoc = await getDoc(doc(db, 'clinics', clinicId));
        if (clinicDoc.exists()) {
          console.log(`   ✅ 기존 병원 정보 사용: ${clinicDoc.data().name}`);
        } else {
          clinicId = null;
        }
      }
    }

    if (!clinicId) {
      // 새 병원 생성
      const clinicData = {
        name: '행복동물병원',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        ownerUserId: clinicUid,
        createdAt: getDate(60),
        updatedAt: getDate(0)
      };
      const clinicRef = await addDoc(collection(db, 'clinics'), clinicData);
      clinicId = clinicRef.id;
      
      // 사용자 정보 업데이트
      await updateDoc(doc(db, 'users', clinicUid), {
        defaultClinicId: clinicId,
        userMode: 'clinic',
        roles: ['clinic_owner']
      });
      
      console.log(`   ✅ 새 병원 생성 완료: 행복동물병원 (ID: ${clinicId})`);
    }

    // 2. 예약 기록 생성 (50개)
    console.log('\n📅 예약 기록 생성 중...');
    
    const bookings = [];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(i / 7);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const time = times[Math.floor(Math.random() * times.length)];
      
      bookings.push({
        userId: `U${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`, // 랜덤 사용자
        petId: `PET${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`, // 랜덤 펫
        clinicId: clinicId,
        hospitalName: '행복동물병원',
        date: getDate(daysAgo),
        time: time,
        status: status,
        reason: ['예방접종', '정기검진', '증상 진료', '수술 상담'][Math.floor(Math.random() * 4)],
        createdAt: getDate(daysAgo + 1),
        updatedAt: getDate(daysAgo)
      });
    }

    const bookingIds = [];
    for (const booking of bookings) {
      const ref = await addDoc(collection(db, 'bookings'), booking);
      bookingIds.push(ref.id);
    }
    console.log(`   ✅ 예약 기록 50개 생성 완료`);

    // 3. 진료 결과 생성 (~40개, 완료된 예약 기준)
    console.log('\n📋 진료 결과 생성 중...');
    
    const completedBookings = bookings.filter(b => b.status === 'completed').slice(0, 40);
    const clinicResults = [];
    
    for (let i = 0; i < completedBookings.length; i++) {
      const booking = completedBookings[i];
      clinicResults.push({
        userId: booking.userId,
        petId: booking.petId,
        clinicId: clinicId,
        hospitalName: '행복동물병원',
        bookingId: bookingIds[bookings.indexOf(booking)],
        diagnosis: ['피부염', '소화불량', '호흡기 감염', '치아 문제', '정상'][Math.floor(Math.random() * 5)],
        treatment: '처방약 복용 및 경과 관찰',
        prescription: ['항생제', '소화제', '항히스타민제', '진통제'][Math.floor(Math.random() * 4)],
        notes: '정기 검진 완료',
        createdAt: booking.date,
        updatedAt: booking.date
      });
    }

    for (const result of clinicResults) {
      await addDoc(collection(db, 'clinicResults'), result);
    }
    console.log(`   ✅ 진료 결과 ${clinicResults.length}개 생성 완료`);

    // 4. 등록 환자 생성 (10~15마리)
    console.log('\n👥 등록 환자 생성 중...');
    
    const patientCount = 12; // 10~15 중간값
    const patients = [];
    
    for (let i = 0; i < patientCount; i++) {
      const species = ['dog', 'cat'][Math.floor(Math.random() * 2)];
      const breeds = species === 'dog' 
        ? ['말티즈', '푸들', '비글', '골든리트리버']
        : ['페르시안', '샴', '러시안블루', '코리안숏헤어'];
      
      patients.push({
        clinicId: clinicId,
        clinicName: '행복동물병원',
        petId: `PET${String(i + 1).padStart(4, '0')}`,
        petName: ['초코', '나비', '루이', '미미', '뽀삐', '치즈', '코코', '별이', '하늘이', '구름이'][i],
        species: species,
        speciesLabelKo: species === 'dog' ? '강아지' : '고양이',
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        birthDate: getDate(365 * (2 + Math.floor(Math.random() * 5))),
        ownerUserId: `U${String(i + 1).padStart(4, '0')}`,
        visitCount: Math.floor(Math.random() * 5) + 1,
        lastVisitDate: getDate(Math.floor(Math.random() * 30)),
        lastDiagnosis: ['정상', '피부염', '소화불량'][Math.floor(Math.random() * 3)],
        lastTriageLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        lastWeightKg: (2 + Math.random() * 5).toFixed(1),
        createdAt: getDate(30 + i),
        updatedAt: getDate(Math.floor(Math.random() * 30))
      });
    }

    for (const patient of patients) {
      await addDoc(collection(db, 'clinicPatients'), patient);
    }
    console.log(`   ✅ 등록 환자 ${patientCount}마리 생성 완료`);

    console.log('\n✅ 병원 계정 데이터 생성 완료!');
    return {
      success: true,
      clinicId: clinicId,
      bookings: 50,
      clinicResults: clinicResults.length,
      patients: patientCount
    };
  } catch (error) {
    console.error('❌ 병원 데이터 생성 오류:', error);
    throw error;
  }
}

