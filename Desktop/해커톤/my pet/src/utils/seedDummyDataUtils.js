/**
 * 더미데이터 시드 유틸리티
 * FAQ 및 유저 데이터를 Firestore에 업로드
 */

import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc } from 'firebase/firestore';

// FAQ 데이터와 유저 데이터 JSON 파일 경로 (public 폴더 기준)
const FAQ_DATA_PATH = '/더미데이터/owner_faq_seed_260.json';
const USER_DATA_PATH = '/더미데이터/users_seed_300_null_profile.json';

/**
 * FAQ 데이터를 Firestore에 업로드
 * @param {boolean} force - 기존 데이터가 있어도 강제로 업로드할지 여부
 * @returns {Promise<{success: boolean, count: number, errors: string[]}>}
 */
export async function seedOwnerFAQ(force = false) {
  const errors = [];
  let uploadedCount = 0;

  try {
    // 기존 데이터 확인
    if (!force) {
      const existingQuery = query(collection(db, 'owner_faq'));
      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        throw new Error(`기존 FAQ 데이터가 ${existingSnapshot.size}개 있습니다. 강제 업로드를 원하면 force=true를 사용하세요.`);
      }
    }

    // JSON 파일 로드
    const response = await fetch(FAQ_DATA_PATH);
    if (!response.ok) {
      throw new Error(`FAQ 데이터 파일을 불러올 수 없습니다: ${response.statusText}`);
    }
    const faqData = await response.json();

    if (!Array.isArray(faqData)) {
      throw new Error('FAQ 데이터가 배열 형식이 아닙니다.');
    }

    console.log(`[Seed FAQ] ${faqData.length}개의 FAQ 데이터 업로드 시작...`);

    // 배치로 업로드 (Firestore 제한: 500개씩)
    const batchSize = 500;
    for (let i = 0; i < faqData.length; i += batchSize) {
      const batch = faqData.slice(i, i + batchSize);
      const promises = batch.map(async (item) => {
        try {
          // 타임스탬프 추가
          const dataToUpload = {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await addDoc(collection(db, 'owner_faq'), dataToUpload);
          uploadedCount++;
        } catch (error) {
          errors.push(`FAQ 항목 업로드 실패: ${error.message}`);
          console.error('[Seed FAQ] 항목 업로드 오류:', error);
        }
      });

      await Promise.all(promises);
      console.log(`[Seed FAQ] ${Math.min(i + batchSize, faqData.length)}/${faqData.length} 업로드 완료`);
    }

    console.log(`[Seed FAQ] 완료: ${uploadedCount}개 업로드됨`);
    return {
      success: true,
      count: uploadedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('[Seed FAQ] 오류:', error);
    return {
      success: false,
      count: uploadedCount,
      errors: [error.message, ...errors]
    };
  }
}

/**
 * 유저 데이터를 Firestore에 업로드
 * @param {boolean} force - 기존 데이터가 있어도 강제로 업로드할지 여부
 * @returns {Promise<{success: boolean, count: number, errors: string[]}>}
 */
export async function seedUsers(force = false) {
  const errors = [];
  let uploadedCount = 0;

  try {
    // 기존 데이터 확인
    if (!force) {
      const existingQuery = query(collection(db, 'users'));
      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        throw new Error(`기존 유저 데이터가 ${existingSnapshot.size}개 있습니다. 강제 업로드를 원하면 force=true를 사용하세요.`);
      }
    }

    // JSON 파일 로드
    const response = await fetch(USER_DATA_PATH);
    if (!response.ok) {
      throw new Error(`유저 데이터 파일을 불러올 수 없습니다: ${response.statusText}`);
    }
    const userData = await response.json();

    if (!Array.isArray(userData)) {
      throw new Error('유저 데이터가 배열 형식이 아닙니다.');
    }

    console.log(`[Seed Users] ${userData.length}개의 유저 데이터 업로드 시작...`);

    // 배치로 업로드 (Firestore 제한: 500개씩)
    const batchSize = 500;
    for (let i = 0; i < userData.length; i += batchSize) {
      const batch = userData.slice(i, i + batchSize);
      const promises = batch.map(async (item) => {
        try {
          // uid를 문서 ID로 사용
          const userId = item.uid || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // 타임스탬프 추가 및 데이터 정리
          const dataToUpload = {
            ...item,
            createdAt: item.created_at ? new Date(item.created_at) : serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: item.last_login_at ? new Date(item.last_login_at) : null
          };

          // uid 필드 제거 (문서 ID로 사용)
          delete dataToUpload.uid;
          delete dataToUpload.created_at;
          delete dataToUpload.last_login_at;

          // setDoc 사용하여 uid를 문서 ID로 설정
          await setDoc(doc(db, 'users', userId), dataToUpload, { merge: true });
          uploadedCount++;
        } catch (error) {
          errors.push(`유저 항목 업로드 실패: ${error.message}`);
          console.error('[Seed Users] 항목 업로드 오류:', error);
        }
      });

      await Promise.all(promises);
      console.log(`[Seed Users] ${Math.min(i + batchSize, userData.length)}/${userData.length} 업로드 완료`);
    }

    console.log(`[Seed Users] 완료: ${uploadedCount}개 업로드됨`);
    return {
      success: true,
      count: uploadedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('[Seed Users] 오류:', error);
    return {
      success: false,
      count: uploadedCount,
      errors: [error.message, ...errors]
    };
  }
}

/**
 * 모든 더미데이터 시드
 * @param {boolean} force - 기존 데이터가 있어도 강제로 업로드할지 여부
 * @returns {Promise<{faq: object, users: object}>}
 */
export async function seedAllDummyData(force = false) {
  const results = {
    faq: { success: false, count: 0, errors: [] },
    users: { success: false, count: 0, errors: [] }
  };

  // FAQ 업로드
  results.faq = await seedOwnerFAQ(force);
  
  // 유저 업로드
  results.users = await seedUsers(force);

  return results;
}

