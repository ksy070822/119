/**
 * 카카오 로그인 서비스
 */

const KAKAO_JS_KEY = '72f88f8c8193dd28d0539df80f16ab87';
const KAKAO_REST_API_KEY = '6a6433ff3ccbbc31a0448cae49055e4d';
// 리다이렉트 URI는 현재 페이지로 설정 (카카오 개발자 콘솔에 등록 필요)
const KAKAO_REDIRECT_URI = window.location.origin + window.location.pathname;

// Kakao SDK 초기화 상태
let isKakaoInitialized = false;

/**
 * 모바일 환경 감지
 */
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 임베디드 브라우저 감지 (카카오톡, 인스타그램 등)
 */
const isEmbeddedBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /KAKAOTALK|FBAN|FBAV|Instagram|Line|NAVER|Daum/i.test(ua) ||
    (ua.indexOf('wv') > -1) ||
    (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua));
};

/**
 * Kakao SDK 스크립트 동적 로드
 */
const loadKakaoScript = () => {
  return new Promise((resolve, reject) => {
    // 이미 스크립트가 있는지 확인
    if (window.Kakao) {
      resolve(true);
      return;
    }

    // 이미 로드 중인 스크립트가 있는지 확인
    const existingScript = document.querySelector('script[src*="kakao_js_sdk"]');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => reject(new Error('Kakao SDK 로딩 실패'));
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js';
    // integrity 속성 제거 - SDK 업데이트 시 해시 불일치 문제 방지
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      reject(new Error('Kakao SDK 스크립트 로딩 실패'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Kakao SDK 초기화
 */
export const initKakao = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 이미 초기화되어 있으면 바로 반환
      if (isKakaoInitialized && window.Kakao?.isInitialized()) {
        resolve(true);
        return;
      }

      // SDK 스크립트 로드
      await loadKakaoScript();

      // SDK 로드 대기 (최대 10초)
      let attempts = 0;
      const maxAttempts = 100;

      const checkKakao = setInterval(() => {
        attempts++;

        if (window.Kakao) {
          clearInterval(checkKakao);
          try {
            if (!window.Kakao.isInitialized()) {
              window.Kakao.init(KAKAO_JS_KEY);
            }
            isKakaoInitialized = true;
            resolve(true);
          } catch (error) {
            reject(new Error('Kakao SDK 초기화 오류: ' + error.message));
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkKakao);
          reject(new Error('Kakao SDK 로딩 시간 초과'));
        }
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 카카오 로그인
 * REST API를 사용하여 implicit grant 방식으로 로그인
 */
export const loginWithKakao = (userMode = 'guardian') => {
  return new Promise(async (resolve, reject) => {
    try {
      // 유저 모드 저장
      sessionStorage.setItem('pendingUserMode', userMode);
      sessionStorage.setItem('pendingKakaoLogin', 'true');

      // REST API를 사용한 implicit grant 방식 (SDK 우회)
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=token&scope=profile_nickname,profile_image,account_email`;

      window.location.href = kakaoAuthUrl;

      // 리다이렉트 되므로 여기서 반환
      resolve({ success: false, redirecting: true });
    } catch (error) {
      console.error('카카오 로그인 시작 실패:', error);
      reject({ success: false, error: '카카오 로그인을 시작할 수 없습니다.' });
    }
  });
};

/**
 * 카카오 리다이렉트 결과 처리
 * URL 해시에서 access_token을 추출하고 REST API로 사용자 정보 조회
 */
export const handleKakaoRedirectResult = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 카카오 로그인 대기 중인지 확인
      const isPending = sessionStorage.getItem('pendingKakaoLogin');
      if (!isPending) {
        resolve({ success: false, noPending: true });
        return;
      }

      // URL 해시에서 access_token 확인 (implicit grant)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');

      // URL 쿼리에서 error 확인
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // 에러 확인
      if (error) {
        sessionStorage.removeItem('pendingKakaoLogin');
        sessionStorage.removeItem('pendingUserMode');
        window.history.replaceState({}, document.title, window.location.pathname);
        reject({ success: false, error: errorDescription || '카카오 로그인이 취소되었습니다.' });
        return;
      }

      // access_token이 있으면 REST API로 사용자 정보 조회
      if (accessToken) {
        // URL 정리
        window.history.replaceState({}, document.title, window.location.pathname);

        try {
          // REST API로 사용자 정보 가져오기
          const response = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
          });

          if (!response.ok) {
            throw new Error('사용자 정보 조회 실패');
          }

          const res = await response.json();
          const userMode = sessionStorage.getItem('pendingUserMode') || 'guardian';
          sessionStorage.removeItem('pendingKakaoLogin');
          sessionStorage.removeItem('pendingUserMode');

          const kakaoUser = {
            uid: `kakao_${res.id}`,
            email: res.kakao_account?.email || `kakao_${res.id}@kakao.com`,
            displayName: res.kakao_account?.profile?.nickname || '카카오 사용자',
            photoURL: res.kakao_account?.profile?.profile_image_url || null,
            provider: 'kakao',
            kakaoId: res.id,
            userMode,
          };
          resolve({ success: true, user: kakaoUser });
        } catch (fetchError) {
          sessionStorage.removeItem('pendingKakaoLogin');
          sessionStorage.removeItem('pendingUserMode');
          console.error('카카오 사용자 정보 조회 실패:', fetchError);
          reject({ success: false, error: '사용자 정보를 가져올 수 없습니다.' });
        }
        return;
      }

      // 토큰이 없는 경우
      sessionStorage.removeItem('pendingKakaoLogin');
      resolve({ success: false, noToken: true });
    } catch (error) {
      sessionStorage.removeItem('pendingKakaoLogin');
      sessionStorage.removeItem('pendingUserMode');
      console.error('카카오 리다이렉트 결과 처리 실패:', error);
      reject({ success: false, error: 'Kakao 로그인 처리에 실패했습니다.' });
    }
  });
};

/**
 * 카카오 로그아웃
 */
export const logoutKakao = () => {
  return new Promise(async (resolve) => {
    try {
      await initKakao();

      if (window.Kakao.Auth.getAccessToken()) {
        window.Kakao.Auth.logout(() => {
          resolve({ success: true });
        });
      } else {
        resolve({ success: true });
      }
    } catch (error) {
      console.error('카카오 로그아웃 실패:', error);
      resolve({ success: false });
    }
  });
};

/**
 * 카카오 연결 끊기 (탈퇴)
 */
export const unlinkKakao = () => {
  return new Promise(async (resolve) => {
    try {
      await initKakao();

      window.Kakao.API.request({
        url: '/v1/user/unlink',
        success: () => {
          resolve({ success: true });
        },
        fail: (error) => {
          console.error('카카오 연결 끊기 실패:', error);
          resolve({ success: false, error });
        },
      });
    } catch (error) {
      resolve({ success: false, error });
    }
  });
};

export default {
  initKakao,
  loginWithKakao,
  handleKakaoRedirectResult,
  logoutKakao,
  unlinkKakao,
};
