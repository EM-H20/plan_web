/**
 * 네이버 맵 API 관련 유틸리티 함수들
 */

// 네이버 지도 초기화 함수
export const initNaverMap = (elementId, options = {}) => {
  // 네이버 맵 API가 로드되었는지 확인
  if (!window.naver || !window.naver.maps) {
    console.error('네이버 지도 API가 로드되지 않았습니다.');
    return null;
  }

  // 기본 옵션과 사용자 옵션 병합
  const defaultOptions = {
    center: new window.naver.maps.LatLng(37.549186395087, 127.07505567644), // 세종대
    zoom: 15,
    zoomControl: true,
    zoomControlOptions: {
      position: window.naver.maps.Position.TOP_RIGHT
    }
  };

  const mapOptions = { ...defaultOptions, ...options };
  
  // 지도 생성 및 반환
  return new window.naver.maps.Map(elementId, mapOptions);
};

// 지도에 마커 추가 함수
export const addMarker = (map, position, options = {}) => {
  if (!map || !window.naver || !window.naver.maps) return null;

  return new window.naver.maps.Marker({
    map,
    position,
    ...options
  });
};

// 지도에 정보창 생성 함수
export const createInfoWindow = (content) => {
  if (!window.naver || !window.naver.maps) return null;

  return new window.naver.maps.InfoWindow({
    content,
    maxWidth: 300,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 2,
    anchorSize: new window.naver.maps.Size(10, 10),
    anchorColor: "#fff",
    pixelOffset: new window.naver.maps.Point(10, -10)
  });
};

// 주소로 좌표 검색 (Geocoding)
export const geocodeAddress = async (address) => {
  // 네이버 Geocoding API 사용 예시 (실제로는 API 키 필요)
  // 실제 구현 시에는 네이버 클라우드 플랫폼에서 제공하는 API를 사용해야 합니다
  console.log(`주소 "${address}"의, 지오코딩을 수행합니다`);
  
  // 여기에 실제 Geocoding 코드 구현
  // 예시 코드일 뿐 실제로는 네이버 API 호출 코드로 대체되어야 함
  return { lat: 37.5665, lng: 126.9780 }; // 임시 응답
};

// 현재 위치 가져오기
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};
