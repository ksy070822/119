/**
 * 카카오 로그인 서비스
 */

const KAKAO_JS_KEY = '72f88f8c8193dd28d0539df80f16ab87';

// 리다이렉트 URI 설정 (GitHub Pages 배포 환경 고려)
const getKakaoRedirectURI = () => {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  
  // GitHub Pages 배포 환경 감지 (/ai-factory/ 경로 포함)
  if (pathname.includes('/ai-factory/')) {
    return `${origin}/ai-factory/`;
  }
  
  // 로컬 개발 환경 - 포트 번호 포함
  // localhost:5173, localhost:3000 등
  return `${origin}${pathname}`.replace(/\/$/, '') || origin;
};

const KAKAO_REDIRECT_URI = getKakaoRedirectURI();

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
    try {
      await loadKakaoScript();
    } catch (loadError) {
      console.error('Kakao SDK 스크립트 로딩 실패:', loadError);
      // 네트워크 오류일 경우 재시도
      if (loadError.message.includes('로딩 실패')) {
        console.log('Kakao SDK 재시도 중...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await loadKakaoScript();
        } catch (retryError) {
          reject(new Error('Kakao SDK 스크립트를 로드할 수 없습니다. 네트워크 연결을 확인해주세요.'));
          return;
        }
      } else {
        reject(loadError);
        return;
      }
    }

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
          console.error('Kakao SDK 초기화 오류:', error);
          reject(new Error('Kakao SDK 초기화 오류: ' + error.message));
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkKakao);
        reject(new Error('Kakao SDK 로딩 시간 초과. 페이지를 새로고침해주세요.'));
      }
    }, 100);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 카카오 로그인
 * Kakao SDK 2.x에서는 authorize (리다이렉트 방식)만 지원
 */
export const loginWithKakao = (userMode = 'guardian') => {
  return new Promise(async (resolve, reject) => {
    try {
      await initKakao();

      // 유저 모드 저장
      sessionStorage.setItem('pendingUserMode', userMode);
      sessionStorage.setItem('pendingKakaoLogin', 'true');

      // 리다이렉트 방식으로 로그인 (SDK 2.x는 이 방식만 지원)
      // 카카오 SDK 2.x에서는 redirectUri만 지원 (responseType, scope는 지원하지 않음)
      const redirectUri = getKakaoRedirectURI();
      console.log('[Kakao Login] Redirect URI:', redirectUri);
      
      window.Kakao.Auth.authorize({
        redirectUri: redirectUri
      });

      // 리다이렉트 되므로 여기서 반환
      resolve({ success: false, redirecting: true });
    } catch (error) {
      console.error('카카오 초기화 실패:', error);
      reject({ success: false, error: 'Kakao SDK 초기화에 실패했습니다.' });
    }
  });
};

/**
 * 카카오 리다이렉트 결과 처리
 * URL 해시에서 access_token을 추출하거나 code를 확인
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

      await initKakao();

      // URL 해시에서 access_token 확인 (implicit grant)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');

      // URL 쿼리에서 code 확인 (authorization code grant)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      // 에러 확인
      if (error) {
        sessionStorage.removeItem('pendingKakaoLogin');
        sessionStorage.removeItem('pendingUserMode');
        window.history.replaceState({}, document.title, window.location.pathname);
        reject({ success: false, error: '카카오 로그인이 취소되었습니다.' });
        return;
      }

      // access_token이 있으면 바로 사용
      if (accessToken) {
        window.Kakao.Auth.setAccessToken(accessToken);

        // URL 정리
        window.history.replaceState({}, document.title, window.location.pathname);

        // 사용자 정보 가져오기
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
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
          },
          fail: (error) => {
            sessionStorage.removeItem('pendingKakaoLogin');
            sessionStorage.removeItem('pendingUserMode');
            console.error('카카오 사용자 정보 조회 실패:', error);
            reject({ success: false, error: '사용자 정보를 가져올 수 없습니다.' });
          },
        });
        return;
      }

      // code만 있는 경우 - 카카오 SDK 2.x가 자동으로 토큰을 처리했을 수 있음
      if (code) {
        // URL 정리 (code 제거)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // SDK가 이미 토큰을 처리했는지 확인
        const existingToken = window.Kakao.Auth.getAccessToken();
        if (existingToken) {
          console.log('[Kakao] SDK가 자동으로 토큰을 처리했습니다.');
          // 사용자 정보 가져오기
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res) => {
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
            },
            fail: (error) => {
              sessionStorage.removeItem('pendingKakaoLogin');
              sessionStorage.removeItem('pendingUserMode');
              console.error('카카오 사용자 정보 조회 실패:', error);
              reject({ success: false, error: '사용자 정보를 가져올 수 없습니다.' });
            },
          });
          return;
        }
        
        // 토큰이 없으면 카카오 개발자 콘솔 설정 문제
        sessionStorage.removeItem('pendingKakaoLogin');
        sessionStorage.removeItem('pendingUserMode');
        reject({ 
          success: false, 
          error: '카카오 로그인 설정을 확인해주세요.\n\n카카오 개발자 콘솔에서:\n1. Redirect URI가 정확히 등록되었는지 확인\n2. 카카오 로그인 활성화 확인\n3. 동의 항목 설정 확인' 
        });
        return;
      }

      // 토큰도 코드도 없는 경우
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
