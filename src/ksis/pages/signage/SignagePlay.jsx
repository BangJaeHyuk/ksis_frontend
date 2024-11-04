import React, { useEffect, useState, useCallback, useRef } from "react";
import Modal from "react-modal";
import fetcher from "../../../fetcher";
import {
  SIGNAGE_PLAY,
  SIGNAGE_PLAY_NOTICE,
} from "../../../constants/api_constant";
import Loading from "../../components/Loading";

const SignagePlay = ({ isOpen, onRequestClose, signageId }) => {
  const [resources, setResources] = useState([]);
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutIdRef = useRef(null);
  const [date, setDate] = useState(() => new Date());
  const [weather, setWeather] = useState({});

  const [loading, setLoading] = useState(true);

  const loadModal = useCallback(async () => {
    try {
      const [responseResource, responseNotice] = await Promise.all([
        fetcher.get(SIGNAGE_PLAY + `/${signageId}`),
        fetcher.get(SIGNAGE_PLAY_NOTICE + `/${signageId}`),
      ]);
      setResources(responseResource.data);
      setNotices(responseNotice.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [signageId]);

  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;

    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      getWeather(lat, lon);
    });

    if (scrollContainer) {
      const handleAnimationIteration = () => {
        scrollContainer.appendChild(scrollContainer.firstChild.cloneNode(true));
        scrollContainer.style.animation = "none"; // 애니메이션 일시 중지
        void scrollContainer.offsetHeight; // 리플로우 강제하여 애니메이션 재시작
        scrollContainer.style.animation = ""; // 애니메이션 재시작
      };

      scrollContainer.addEventListener(
        "animationiteration",
        handleAnimationIteration
      );

      return () => {
        scrollContainer.removeEventListener(
          "animationiteration",
          handleAnimationIteration
        );
      };
    }
  }, []);
  const combinedNotices = notices.join(
    " \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 "
  );

  const showNextImage = useCallback(() => {
    const container = document.getElementById("container");

    if (resources.length > 0 && container) {
      const resource = resources[currentIndex];

      // 일정 시간 후에 새로운 이미지나 비디오를 페이드 인
      setTimeout(() => {
        // 새로운 이미지 또는 비디오 요소 생성
        let newElement;

        if (resource.resourceType === "IMAGE") {
          newElement = document.createElement("img");
          newElement.alt = "이미지 로딩 오류";
        } else if (resource.resourceType === "VIDEO") {
          newElement = document.createElement("video");
          newElement.autoplay = true;
          // newElement.muted = true;
        }
        newElement.src = resource.filePath;

        if (resource.resolution) {
          newElement.style.width = "100%";
          newElement.style.height = "auto";
        } else {
          newElement.style.height = "100%";
          newElement.style.width = "auto"; // 가로는 자동
          // newElement.style.objectFit = "contain"; // 비율 유지
        }
        newElement.style.display = "block";
        newElement.style.margin = "auto";

        // 기존 요소가 있으면 교체, 없으면 추가
        if (container.firstChild) {
          container.replaceChild(newElement, container.firstChild);
        } else {
          container.appendChild(newElement);
        }

        // 다음 이미지를 일정 시간 후에 표시
        timeoutIdRef.current = setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % resources.length);
        }, resource.playTime * 1000);
      }, 50); // 페이드 아웃 시간이 지난 후 새 이미지로 전환
    }
  }, [resources, currentIndex]);

  useEffect(() => {
    if (isOpen && signageId) {
      loadModal();
    }
  }, [isOpen, signageId, loadModal]);

  useEffect(() => {
    if (isOpen && resources.length > 0) {
      showNextImage();
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [isOpen, resources, showNextImage]);

  // useEffect(() => {
  //   const fullscreenchangeHandler = () => {
  //     if (!document.fullscreenElement) {
  //       onRequestClose(); // 전체화면이 종료되면 모달도 닫기
  //     }
  //   };

  //   window.addEventListener("fullscreenchange", fullscreenchangeHandler);

  //   // 모달이 열릴 때 전체화면 모드로 전환
  //   if (isOpen && !document.fullscreenElement) {
  //     document.documentElement.requestFullscreen();
  //   }

  //   return () => {
  //     window.removeEventListener("fullscreenchange", fullscreenchangeHandler);
  //   };
  // }, [isOpen, onRequestClose]);

  //현재 시간 표시
  useEffect(() => {
    const timeId = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(timeId);
    };
  });

  const tick = () => {
    setDate(new Date());
  };

  const getWeather = async (lat, lon) => {
    const apiKey = process.env.REACT_APP_WEATHER_KEY;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      ).then((response) => {
        return response.json();
      });

      console.log("res:", res);

      // 날씨 아이콘 가져오기
      const weatherIcon = res.weather[0].icon;

      const weatherIconAdrs = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
      // 소수점 버리기
      const temp = Math.round(res.main.temp);

      setWeather({
        temp: temp,
        icon: weatherIconAdrs,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // if (loading) {
  //   return <Loading />;
  // }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnEsc={true}
      style={{
        content: {
          width: "100%",
          height: "100%",
          inset: "0px",
          padding: "0px",
        },
        overlay: {
          position: "fixed",
          zIndex: 30,
        },
      }}
    >
      <div
        id="container"
        className="h-full w-full fixed left-0 top-0 bg-black flex items-center justify-center align-middle"
      ></div>

      <div className="h-1/12 w-full bg-gray-300/30 flex items-center fixed left-0 bottom-0">
        <div className="flex-auto text-center w-1/12  mr-5">
          <div className="flex">
            <img
              src={weather.icon}
              alt="이미지를 불러올 수 없습니다."
              className="m-aut"
            />
            <div className="m-auto text-4xl font-bold text-black">
              {weather.temp}℃
            </div>
          </div>
        </div>
        <div className="overflow-hidden flex-auto w-10/12">
          <div ref={scrollRef} className="whitespace-nowrap animate-flow">
            <span className="text-5xl font-bold text-black">
              {combinedNotices}
            </span>
          </div>
        </div>

        <div className="flex-auto text-center w-1/12 text-3xl font-bold text-black">
          {date.toLocaleTimeString()}
        </div>
      </div>
    </Modal>
  );
};

export default SignagePlay;
