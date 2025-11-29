// 카카오맵 API 서비스
const KAKAO_REST_API_KEY = '6a6433ff3ccbbc31a0448cae49055e4d'; // REST API 키 (필요시 사용)

// SDK 로딩 상태 관리
let kakaoLoaded = false;
let kakaoLoadingPromise = null;

/**
 * 카카오맵 SDK 로드 (중복 로드 방지)
 */
export function loadKakao() {
  if (kakaoLoaded) return Promise.resolve(window.kakao);
  if (kakaoLoadingPromise) return kakaoLoadingPromise;

  kakaoLoadingPromise = new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      kakaoLoaded = true;
      resolve(window.kakao);
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(checkInterval);
        kakaoLoaded = true;
        resolve(window.kakao);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (!kakaoLoaded) {
        reject(new Error("Kakao Maps SDK 로딩 실패"));
      }
    }, 10000);
  });

  return kakaoLoadingPromise;
}

/**
 * 현재 위치 가져오기 (Geolocation API)
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation을 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // 위치 권한이 거부되면 서울 강남구 좌표 반환 (Fallback)
        console.warn('위치 권한이 거부되었습니다. 기본 위치(서울 강남구)를 사용합니다.');
        resolve({
          lat: 37.4979,
          lng: 127.0276,
        });
      }
    );
  });
}

/**
 * 카카오맵 JavaScript SDK로 동물병원 검색
 */
export async function searchAnimalHospitals(lat, lng, radius = 3000) {
  try {
    const kakao = await loadKakao();
    
    return new Promise((resolve, reject) => {
      const places = new kakao.maps.services.Places();
      const callback = function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const hospitals = result.map((place) => ({
            id: place.id,
            name: place.place_name,
            address: place.address_name,
            roadAddress: place.road_address_name,
            phone: place.phone,
            distance: parseInt(place.distance),
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            category: place.category_name,
            url: place.place_url,
            is24Hours: place.place_name.includes('24') || place.place_name.includes('응급'),
          })).sort((a, b) => a.distance - b.distance);
          
          resolve(hospitals);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error('검색 중 오류가 발생했습니다.'));
        }
      };

      const options = {
        location: new kakao.maps.LatLng(lat, lng),
        radius: radius,
        sort: kakao.maps.services.SortBy.DISTANCE,
      };

      places.keywordSearch('동물병원', callback, options);
    });
  } catch (error) {
    console.error('동물병원 검색 오류:', error);
    return getMockHospitals(lat, lng);
  }
}

/**
 * 모킹 병원 데이터 (API 실패 시 사용)
 */
function getMockHospitals(lat, lng) {
  return [
    {
      id: 'h1',
      name: '서울 24시 동물메디컬센터',
      address: '서울시 강남구 강남대로 123',
      roadAddress: '서울시 강남구 강남대로 123',
      phone: '02-1234-5678',
      distance: 1200,
      lat: lat + 0.01,
      lng: lng + 0.01,
      category: '동물병원',
      url: '',
      is24Hours: true,
      rating: 4.7,
      reviewCount: 128,
      homepage: null,
      businessHours: null,
    },
    {
      id: 'h2',
      name: '행복한 동물병원',
      address: '서울시 강남구 테헤란로 45',
      roadAddress: '서울시 강남구 테헤란로 45',
      phone: '02-2345-6789',
      distance: 800,
      lat: lat + 0.008,
      lng: lng + 0.008,
      category: '동물병원',
      url: '',
      is24Hours: false,
      rating: 4.9,
      reviewCount: 254,
      homepage: null,
      businessHours: null,
    },
    {
      id: 'h3',
      name: '김박사 고양이 병원',
      address: '서울시 송파구',
      roadAddress: '서울시 송파구 올림픽로 300',
      phone: '02-3456-7890',
      distance: 2500,
      lat: lat + 0.02,
      lng: lng + 0.02,
      category: '동물병원',
      url: '',
      is24Hours: false,
      rating: 4.8,
      reviewCount: 188,
      homepage: null,
      businessHours: null,
    },
  ];
}

/**
 * 카카오맵 지도 초기화
 */
export async function initKakaoMap(containerId, lat, lng) {
  const kakao = await loadKakao();
  
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('지도 컨테이너를 찾을 수 없습니다.');
  }

  const options = {
    center: new kakao.maps.LatLng(lat, lng),
    level: 5, // 지도 확대 레벨
  };

  return new kakao.maps.Map(container, options);
}

/**
 * 지도에 마커 추가
 */
export async function addMarker(map, lat, lng, title, is24Hours = false) {
  const kakao = await loadKakao();
  
  const imageSrc = is24Hours
    ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
    : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker.png';
  const imageSize = new kakao.maps.Size(24, 35);
  const imageOption = { offset: new kakao.maps.Point(12, 35) };
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

  const position = new kakao.maps.LatLng(lat, lng);
  const marker = new kakao.maps.Marker({
    position: position,
    image: markerImage,
    title: title,
  });

  marker.setMap(map);

  // 인포윈도우 추가
  const infowindow = new kakao.maps.InfoWindow({
    content: `<div style="padding:5px;font-size:12px;">${title}</div>`,
  });

  kakao.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });

  return marker;
}
