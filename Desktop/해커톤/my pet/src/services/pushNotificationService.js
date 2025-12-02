// 푸시 알림 서비스
import { messaging } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// VAPID 키 (Firebase Console에서 발급받은 키)
const VAPID_KEY = 'BKEaMLnqCvGpIMgn0Qi8eWq3WgzyHtu-pVVcHkBOJLSLYK3WcZ7lZJI8p7Gja0lHM5MPEL8f9CVJEFcJW02SAXM';

/**
 * 푸시 알림 토큰 요청 및 저장
 */
export async function requestPushPermission(userId) {
  if (!messaging) {
    console.warn('Firebase Messaging이 지원되지 않습니다.');
    return null;
  }

  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('푸시 알림 권한이 거부되었습니다.');
      return null;
    }

    // FCM 토큰 가져오기
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      // Firestore에 토큰 저장
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString()
      });
      
      console.log('푸시 알림 토큰 저장 완료:', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('푸시 알림 토큰 요청 오류:', error);
    return null;
  }
}

/**
 * 병원 스태프들에게 푸시 알림 전송
 */
export async function sendNotificationToClinicStaff(clinicId, title, body, data = {}) {
  try {
    // clinicStaff에서 해당 병원의 모든 스태프 찾기
    const staffQuery = query(
      collection(db, 'clinicStaff'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    
    const staffSnapshot = await getDocs(staffQuery);
    const tokens = [];
    
    for (const staffDoc of staffSnapshot.docs) {
      const staffData = staffDoc.data();
      const userDoc = await getDoc(doc(db, 'users', staffData.userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      }
    }
    
    if (tokens.length === 0) {
      console.warn('푸시 알림을 받을 스태프가 없습니다.');
      return { success: false, message: '푸시 알림을 받을 스태프가 없습니다.' };
    }
    
    // FCM Admin SDK를 사용해야 하므로, 여기서는 Firestore에 알림 데이터 저장
    // 실제 푸시는 백엔드에서 처리하거나 Cloud Functions 사용
    const notificationData = {
      type: 'clinic_notification',
      clinicId,
      title,
      body,
      data,
      tokens,
      createdAt: new Date().toISOString(),
      sent: false
    };
    
    // 알림 큐에 저장 (백엔드에서 처리)
    await addDoc(collection(db, 'notificationQueue'), notificationData);
    
    console.log(`푸시 알림 큐에 추가: ${tokens.length}명에게 전송 예정`);
    return { success: true, tokensCount: tokens.length };
    
  } catch (error) {
    console.error('병원 스태프 푸시 알림 전송 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 보호자에게 푸시 알림 전송
 */
export async function sendNotificationToGuardian(userId, title, body, data = {}) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, message: '사용자를 찾을 수 없습니다.' };
    }
    
    const userData = userDoc.data();
    const token = userData.fcmToken;
    
    if (!token) {
      console.warn('사용자의 푸시 알림 토큰이 없습니다.');
      return { success: false, message: '푸시 알림 토큰이 없습니다.' };
    }
    
    // 알림 큐에 저장
    const notificationData = {
      type: 'guardian_notification',
      userId,
      title,
      body,
      data,
      token,
      createdAt: new Date().toISOString(),
      sent: false
    };
    
    await addDoc(collection(db, 'notificationQueue'), notificationData);
    
    console.log('보호자 푸시 알림 큐에 추가');
    return { success: true };
    
  } catch (error) {
    console.error('보호자 푸시 알림 전송 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 포그라운드 메시지 수신 처리
 */
export function setupForegroundMessageHandler(callback) {
  if (!messaging) return null;
  
  return onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload);
    if (callback) {
      callback(payload);
    }
  });
}

