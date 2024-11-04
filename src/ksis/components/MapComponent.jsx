import React, { useEffect } from "react";

const MapComponent = ({ address }) => {
  // 카카오 API 호출
  useEffect(() => {
    const apiKey = process.env.REACT_APP_LOCATION_KEY;
    const script = document.createElement("script");
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    document.head.appendChild(script);

    script.addEventListener("load", () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 초기 중심 좌표 (위도, 경도)
          level: 3, // 지도 확대 레벨
        };
        var map = new window.kakao.maps.Map(container, options);

        var geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });

            map.setCenter(coords);
          }
        });
      });
    });
  }, [address]);

  return (
    <>
      <div id="map" style={{ width: "100%", height: "90%" }}></div>
    </>
  );
};

export default MapComponent;
