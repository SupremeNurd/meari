/* global naver */

// HTML 문서가 모두 로드되면 이 함수를 실행합니다.
// (Vue의 onMounted와 동일한 역할)
document.addEventListener("DOMContentLoaded", () => {

    // 1. HTML에서 id="map"인 요소를 찾습니다.
    // (Vue의 ref="mapElement"와 동일한 역할)
    const mapElement = document.getElementById("map");

    // 2. 지도 초기화에 필요한 변수들
    const clientId = "10cxu0iae1"; // Vue 코드에 있던 클라이언트 ID
    const position = { lat: 37.451601, lng: 127.157875 }; // Vue 코드에 있던 좌표

    // 3. 맵을 생성하는 함수
    function initMap() {
        // mapElement.value (Vue ref) 대신 mapElement (DOM 요소)를 직접 전달
        const map = new naver.maps.Map(mapElement, {
            center: new naver.maps.LatLng(position.lat, position.lng),
            zoom: 14,
        });

        new naver.maps.Marker({
            position: new naver.maps.LatLng(position.lat, position.lng),
            map,
        });
    }

    if (window.naver && window.naver.maps) {
        // 스크립트가 이미 로드된 경우
        initMap();
    } else {
        // 스크립트를 새로 로드해야 하는 경우
        const script = document.createElement("script");
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
        script.async = true;
        script.onload = initMap; // 스크립트 로드가 완료되면 initMap 함수를 실행
        document.head.appendChild(script);
    }
});