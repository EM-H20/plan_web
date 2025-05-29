import React, { useEffect, useState, useRef } from 'react';
import './Map.css';
import defaultImage from '../assets/dafault-place.png'; // 새로 추가된 기본 이미지 사용

// InfoWindow 생성 및 오픈을 담당하는 함수 (컴포넌트 내부에서 사용)
function openInfoWindow({ map, marker, lat, lng, address }) {
  const infoWindow = new window.naver.maps.InfoWindow({
    content: `
      <div style="padding: 10px; min-width: 200px;">
        <p>위도: ${lat.toFixed(6)}</p>
        <p>경도: ${lng.toFixed(6)}</p>
        <p>주소: ${address}</p>
      </div>
    `,
    borderColor: '#ccc',
    borderWidth: 1,
    anchorSize: new window.naver.maps.Size(10, 10)
  });
  infoWindow.open(map, marker);
}

// 중복 제거: 기존 마커 제거
function removeCurrentMarker(markerRef) {
  if (markerRef.current) {
    markerRef.current.setMap(null);
  }
}

// 중복 제거: 새 마커 생성 및 등록
function createAndRegisterMarker(position, mapRef, markerRef) {
  const marker = new window.naver.maps.Marker({
    position,
    map: mapRef.current
  });
  markerRef.current = marker;
  return marker;
}

// 중복 제거: 마커 정보 상태 업데이트
function updateMarkerInfo(setMarkerInfo, lat, lng, address) {
  setMarkerInfo({ lat, lng, address });
}

function Map() {
  // 상태 관리
  const [markerInfo, setMarkerInfo] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [placeDescription, setPlaceDescription] = useState(''); // 장소 설명 추가
  const [placeType, setPlaceType] = useState('Landmark'); // 장소 유형
  const [stayTime, setStayTime] = useState('1h'); // 체류 시간
  const [uploadedImage, setUploadedImage] = useState(null); // 업로드된 이미지
  const [imagePreview, setImagePreview] = useState(''); // 이미지 미리보기 URL
  const [mapLoaded, setMapLoaded] = useState(false);
  const [customAddress, setCustomAddress] = useState(''); // 사용자가 직접 입력한 주소
  const [originalAddress, setOriginalAddress] = useState(''); // 네이버 API에서 받아온 원본 주소
  const [searchQuery, setSearchQuery] = useState(''); // 장소 검색어 추가
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 장소명 또는 주소로 검색
  const searchLocationByQuery = () => {
    if (!searchQuery.trim() || !mapRef.current) return;

    // 지오코딩 서비스를 사용하여 장소를 검색
    window.naver.maps.Service.geocode({
      query: searchQuery
    }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        alert('검색 결과가 없습니다. 다른 이름을 입력해주세요.');
        return;
      }

      // 검색 결과가 없는 경우
      if (response.v2.meta.totalCount === 0) {
        alert('검색 결과가 없습니다. 다른 이름을 입력해주세요.');
        return;
      }



      // 처음 검색된 장소 정보 가져오기
      const firstItem = response.v2.addresses[0];
      const position = new window.naver.maps.LatLng(firstItem.y, firstItem.x);
      
      // 이름과 주소를 자동으로 입력
      if (!placeName.trim()) {
        const nameFromSearch = searchQuery.split(' ')[0]; // 처음 단어를 이름으로 사용
        setPlaceName(nameFromSearch);
      }
      
      // 주소 표시 및 마커 정보 업데이트
      const fullAddress = firstItem.roadAddress || firstItem.jibunAddress;
      setCustomAddress(fullAddress);
      setOriginalAddress(fullAddress); // 원본 주소 저장

      // 지도 이동
      mapRef.current.setCenter(position);
      
      // 기존 마커 제거 (함수로 분리)
      removeCurrentMarker(markerRef);

      // 새 마커 생성 및 등록 (함수로 분리)
      const marker = createAndRegisterMarker(position, mapRef, markerRef);

      // 정보창 표시 (함수로 분리)
      openInfoWindow({
        map: mapRef.current,
        marker,
        lat: position.lat(),
        lng: position.lng(),
        address: firstItem.roadAddress || firstItem.jibunAddress
      });

      // 마커 정보 업데이트 (함수로 분리)
      updateMarkerInfo(setMarkerInfo, position.lat(), position.lng(), fullAddress);
      setShowInput(true);
    });
  };

  // 주소로 마커 위치 업데이트
  const searchAddressAndUpdateMarker = () => {
    if (!customAddress.trim() || !mapRef.current) return;

    // 지오코딩 서비스를 사용하여 주소를 좌표로 변환
    window.naver.maps.Service.geocode({
      query: customAddress
    }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        alert('입력하신 주소를 찾을 수 없습니다. 다른 주소를 입력해주세요.');
        return;
      }

      // 검색 결과가 없는 경우
      if (response.v2.meta.totalCount === 0) {
        alert('검색 결과가 없습니다. 다른 주소를 입력해주세요.');
        return;
      }

      // 처음 검색된 주소 정보 가져오기
      const firstItem = response.v2.addresses[0];
      const position = new window.naver.maps.LatLng(firstItem.y, firstItem.x);
      
      // 지도 이동
      mapRef.current.setCenter(position);
      
      // 기존 마커 제거 (함수로 분리)
      removeCurrentMarker(markerRef);

      // 새 마커 생성 및 등록 (함수로 분리)
      const marker = createAndRegisterMarker(position, mapRef, markerRef);

      // 정보창 표시 (함수로 분리)
      openInfoWindow({
        map: mapRef.current,
        marker,
        lat: position.lat(),
        lng: position.lng(),
        address: firstItem.roadAddress || firstItem.jibunAddress
      });

      // 마커 정보 상태 업데이트 (함수로 분리)
      updateMarkerInfo(setMarkerInfo, position.lat(), position.lng(), firstItem.roadAddress || firstItem.jibunAddress);
      
      // 이미 주소가 입력되어 있으니 customAddress는 업데이트하지 않음
    });
  };

  // 주소 입력 후 일정 시간이 지나면 자동으로 검색하는 기능 (선택적)
  // 현재는 사용자가 검색 버튼을 클릭하거나 Enter 키를 누르는 경우에만 검색되도록 설정

  // 이미지 선택 핸들러
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 검사 (최대 5MB로 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 검사
      if (!file.type.match('image.*')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 이미지를 Base64로 인코딩
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result); // Base64 문자열 저장
        setImagePreview(event.target.result); // 미리보기용 URL 설정
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 업로드 버튼 클릭 핸들러
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // 주소에서 지역 추출 (예: "서울특별시 광진구..." -> "서울")
  const extractLocation = (address) => {
    if (!address) return '';
    
    // 시/도 추출 (서울특별시, 경기도 등)
    const cityMatch = address.match(/([^\s]+시|[^\s]+도|[^\s]+군|[^\s]+구)/);
    if (cityMatch) {
      // "특별시", "광역시" 등의 접미사 제거
      return cityMatch[0].replace(/특별시|광역시|자치시/, '').trim();
    }
    return '';
  };
  
  // 주소 입력 필드에서 Enter 키 입력 시 주소 검색 실행
  const handleAddressKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAddressAndUpdateMarker();
    }
  };
  
  // 장소명 검색 필드에서 Enter 키 입력 시 장소 검색 실행
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocationByQuery();
    }
  };

  // 장소를 localStorage에 저장
  const saveMarkerToLocalStorage = () => {
    if (!markerInfo) return;
    
    // 필수 입력 확인
    const name = placeName.trim();
    if (!name) {
      alert('장소 이름을 입력해주세요.');
      return;
    }
    
    // 네이버 API에서 받아온 원본 주소를 우선적으로 사용
    // 원본 주소가 없는 경우에만 사용자가 입력한 주소 사용
    const finalAddress = originalAddress.trim() || markerInfo.address;
    
    // 장소 위치 (시/도) 추출
    const location = extractLocation(finalAddress);
    
    // 현재 시간을 ID로 사용
    const id = new Date().getTime();
    
    const markerObj = {
      id: id,
      name: name,
      description: placeDescription, // 장소 설명 추가
      address: finalAddress,
      lat: markerInfo.lat,
      lng: markerInfo.lng,
      img: uploadedImage || defaultImage, // 업로드된 이미지 또는 기본 이미지
      location: location, // 추출한 위치 (서울, 부산 등)
      type: placeType, // 장소 유형
      stay: stayTime, // 체류 시간
      popular: false, // 기본값으로 인기 장소 아님
      savedDate: new Date().toISOString(), // 저장 날짜
      favorite: false,
    };

    // localStorage에 기존 데이터 불러오기
    let markers = JSON.parse(localStorage.getItem("markers")) || [];
    markers.push(markerObj);

    // localStorage에 저장
    localStorage.setItem("markers", JSON.stringify(markers));

    // 저장 완료 알림 및 상태 초기화
    alert('위치가 저장되었습니다! Saved 메뉴에서 확인하세요.');
    setPlaceName('');
    setPlaceDescription('');
    setPlaceType('Landmark');
    setStayTime('1h');
    setUploadedImage(null);
    setImagePreview('');
    setSearchQuery('');
    setCustomAddress('');
    setOriginalAddress('');
    setShowInput(false);
  };

  // 마운트 후 네이버 지도 API 확인
  useEffect(() => {
    const checkNaverMapsLoaded = () => {
      // window.naver 객체가 존재하는지 먼저 확인
      if (window.naver && window.naver.maps) {
        console.log('네이버 지도 API가 성공적으로 로드되었습니다!');
        setMapLoaded(true); // 지도 API 로드 완료 표시
      } else {
        console.error('네이버 지도 API를 찾을 수 없습니다. window.naver:', window.naver);
        // 0.5초 후 다시 시도
        setTimeout(checkNaverMapsLoaded, 500);
      }
    };
    
    // 초기 시도
    checkNaverMapsLoaded();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);
  
  // 네이버 지도 초기화
  useEffect(() => {
    // 지도 API가 로드되지 않은 경우 종료
    if (!mapLoaded) return;
    
    console.log('지도 초기화 시작...');
    
    try {
      // 1. 지도 요소 가져오기
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('지도를 표시할 DOM 요소를 찾을 수 없습니다.');
        return;
      }
      
      // 2. 기본 위치 설정 (서울시청)
      const defaultPosition = new window.naver.maps.LatLng(37.5666805, 126.9784147);
      
      // 3. 지도 옵션 설정
      const mapOptions = {
        center: defaultPosition,
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT
        }
      };
      
      // 4. 지도 객체 생성
      console.log('지도 객체 생성 중...');
      const map = new window.naver.maps.Map(mapElement, mapOptions);
      mapRef.current = map;
      console.log('지도 객체 생성 완료!');
      
      // 5. 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const currentPosition = new window.naver.maps.LatLng(latitude, longitude);
          
          // 현재 위치로 지도 이동
          map.setCenter(currentPosition);
          
          // 현재 위치에 마커 표시
          new window.naver.maps.Marker({
            position: currentPosition,
            map: map,
            icon: {
              content: '<div style="width: 16px; height: 16px; background-color: blue; border-radius: 50%; border: 2px solid white;"></div>',
              anchor: new window.naver.maps.Point(8, 8)
            }
          });
          
          console.log('현재 위치로 지도 이동:', latitude, longitude);
        }, error => {
          console.warn('현재 위치를 가져올 수 없습니다:', error);
        });
      }
      
      // 6. 지도 클릭 이벤트 리스너 등록
      window.naver.maps.Event.addListener(map, 'click', function(e) {
        // 클릭한 위치 좌표
        const clickedPosition = e.coord;
        
        // 기존 마커 제거
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        
        // 새 마커 생성
        const marker = new window.naver.maps.Marker({
          position: clickedPosition,
          map: map
        });
        
        markerRef.current = marker;
        
        // 클릭 위치의 주소 정보 가져오기 (Reverse Geocoding)
        window.naver.maps.Service.reverseGeocode({
          coords: clickedPosition,
          orders: [window.naver.maps.Service.OrderType.ADDR, window.naver.maps.Service.OrderType.ROAD_ADDR].join(',')
        }, function(status, response) {
          if (status !== window.naver.maps.Service.Status.OK) {
            console.error('주소 정보를 가져오는데 실패했습니다');
            return;
          }
          
          // 주소 정보 추출
          const result = response.v2;
          const address = result.address.roadAddress || result.address.jibunAddress;
          
          // 정보창 표시 (함수로 분리)
          openInfoWindow({
            map,
            marker,
            lat: clickedPosition.lat(),
            lng: clickedPosition.lng(),
            address
          });
          
          // 마커 정보 업데이트
          const markerData = {
            lat: clickedPosition.lat(),
            lng: clickedPosition.lng(),
            address: address
          };
          
          setMarkerInfo(markerData);
          setCustomAddress(address); // 초기 주소를 사용자 입력용 상태에 설정
          setShowInput(true);
        });
      });
      
      console.log('지도 초기화 완료!');
    } catch (error) {
      console.error('지도 초기화 중 오류 발생:', error);
    }
  }, [mapLoaded]); // mapLoaded 상태가 변경될 때만 실행

  return (
    <div className="map-page">
      {!mapLoaded && (
        <div className="loading-message" style={{ textAlign: 'center', padding: '20px' }}>
          <p>네이버 지도 API를 로딩중입니다...</p>
        </div>
      )}
      
      {/* 장소명 검색 박스 */}
      <div className="search-container">
        <div className="search-box">
          <input 
            type="text" 
            className="search-input" 
            placeholder="장소를 검색하세요" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button 
            className="search-button" 
            onClick={searchLocationByQuery}
          >
            검색
          </button>
        </div>
      </div>

      <div className="map-container">
        <div id="map" style={{ width: '100%', height: '500px', border: '1px solid #ddd' }}></div>
      </div>
      
      {showInput && markerInfo && (
        <div className="marker-info">
          <h3>선택한 위치 정보</h3>
          <div className="input-group">
            <label htmlFor="address"><strong>주소:</strong></label>
            <div className="address-input-container">
              <input 
                type="text" 
                id="address" 
                value={customAddress} 
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyPress={handleAddressKeyPress}
                placeholder="주소를 입력하고 Enter 키나 검색 버튼 클릭"
              />
              <button 
                type="button" 
                className="search-address-btn"
                onClick={searchAddressAndUpdateMarker}
                title="주소로 검색"
              >
                🔍
              </button>
            </div>
          </div>
          <p><strong>위도:</strong> {markerInfo.lat.toFixed(6)}, <strong>경도:</strong> {markerInfo.lng.toFixed(6)}</p>
          
          {/* 이미지 업로드 섹션 */}
          <div className="image-upload-section">
            <div className="image-preview-container" onClick={triggerFileInput}>
              {imagePreview ? (
                <img src={imagePreview} alt="장소 이미지 미리보기" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span>➕</span>
                  <p>사진 추가</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
            />
          </div>
          
          {/* 장소 정보 입력 폼 */}
          <div className="form-container">
            <div className="input-group">
              <label htmlFor="placeName">장소 이름:</label>
              <input 
                type="text" 
                id="placeName" 
                value={placeName} 
                onChange={(e) => setPlaceName(e.target.value)} 
                placeholder="장소 이름을 입력하세요"
              />
            </div>

            <div className="input-group">
              <label htmlFor="placeDescription">장소 설명:</label>
              <textarea
                id="placeDescription"
                value={placeDescription}
                onChange={(e) => setPlaceDescription(e.target.value)}
                placeholder="장소에 대한 설명을 입력하세요"
                rows="3"
                className="description-textarea"
              ></textarea>
            </div>
            
            <div className="input-group">
              <label htmlFor="placeType">장소 유형:</label>
              <select 
                id="placeType" 
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value)}
              >
                <option value="Landmark">랜드마크</option>
                <option value="Restaurant">식당</option>
                <option value="Cafe">카페</option>
                <option value="Shopping">쇼핑</option>
                <option value="Culture">문화/예술</option>
                <option value="Nature">자연/공원</option>
                <option value="Entertainment">엔터테인먼트</option>
                <option value="Accommodation">숙박</option>
              </select>
            </div>
            
            <div className="input-group">
              <label htmlFor="stayTime">체류 시간:</label>
              <select 
                id="stayTime" 
                value={stayTime}
                onChange={(e) => setStayTime(e.target.value)}
              >
                <option value="0.5h">30분</option>
                <option value="1h">1시간</option>
                <option value="1.5h">1시간 30분</option>
                <option value="2h">2시간</option>
                <option value="2–3h">2-3시간</option>
                <option value="3–4h">3-4시간</option>
                <option value="4h+">4시간 이상</option>
              </select>
            </div>
          </div>
          
          <button onClick={saveMarkerToLocalStorage} className="save-button">이 위치 저장하기</button>
        </div>
      )}
      
      <div className="map-guide">
        <p className="guide-text">위치를 저장하려면 지도에서 원하는 위치를 클릭하세요.</p>
        <p className="guide-text">저장한 위치는 <strong>Saved</strong> 메뉴에서 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}

export default Map;