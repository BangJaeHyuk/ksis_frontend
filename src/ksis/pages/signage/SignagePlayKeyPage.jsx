import { useSearchParams } from "react-router-dom";
import {
  SIGNAGE_PLAY,
  SIGNAGE_PLAY_NOTICE,
} from "../../../constants/api_constant";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "../../css/animation.css";
import Loading from "../../components/Loading";

const SignagePlayKeyPage = () => {
  const [searchParam, setSearchParam] = useSearchParams();
  const keyValue = searchParam.get("key");
  const [verification, setVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [combinedNotices, setCombinedNotices] = useState(null);
  const [animationDuration, setAnimationDuration] = useState(0);

  const [resources, setResources] = useState([]);
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutIdRef = useRef(null);
  const [date, setDate] = useState(() => new Date());
  const [weather, setWeather] = useState({});

  const [elapsedTime, setElapsedTime] = useState(0);
  const [deviceId, setDeviceId] = useState("");
  const deviceIdRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const API_WS_URL = process.env.REACT_APP_API_WS_URL;

  const MAX_RETRIES = 5;
  let retryCount = 0;
  const socketRef = useRef(null);

  const scrollRef = useRef(null);

  const loadPage = async () => {
    try {
      // ip & key 검증
      const response = await axios.get(API_BASE_URL + SIGNAGE_PLAY, {
        params: { key: keyValue },
      });
      if (response.status === 200 && response.data !== null) {
        setVerification(true);

        loadResource(response.data);
        loadNotice(response.data);

        setDeviceId(response.data);
        setLoading(false);
      } else {
        console.log("IP와 KEY 검증 실패");
        setVerification(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    deviceIdRef.current = deviceId; // deviceId가 변경될 때마다 ref에 저장
  }, [deviceId]);

  useEffect(() => {
    //페이지 로드
    loadPage();
  }, []);

  const loadResource = async (signageId) => {
    try {
      const response = await axios.get(
        API_BASE_URL + SIGNAGE_PLAY + `/${signageId}`
      );

      if (response.data) {
        setResources(response.data);
        console.log(response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (notices.length > 0) {
      const newCombinedNotices = `${notices.join(
        "  \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0  "
      )}  
        \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 
        ${notices.join("  \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0  ")}`;
      const newAnimationDuration = newCombinedNotices.length / 10;

      setCombinedNotices(newCombinedNotices);
      setAnimationDuration(newAnimationDuration);
    }
  }, [notices]);

  const loadNotice = async (signageId) => {
    try {
      const response = await axios.get(
        API_BASE_URL + SIGNAGE_PLAY_NOTICE + `/${signageId}`
      );

      setNotices(response.data);
      console.log("Notices", response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const connectWebSocket = () => {
    const socket = new WebSocket(
      API_WS_URL + `/ws/device?deviceId=${deviceIdRef.current}`
    );

    socketRef.current = socket;

    socket.onmessage = (event) => {
      if (event.data === "playlistUpdate") {
        console.log("playlistUpdate");
        const container = document.getElementById("container");
        while (container.firstChild) {
          container.removeChild(container.firstChild); // 첫 번째 자식 노드가 없어질 때까지 제거
        }

        loadResource(deviceIdRef.current);
      } else if (event.data === "noticeUpdate") {
        console.log("noticeUpdate");
        loadNotice(deviceIdRef.current);
      }
    };

    socket.onopen = () => {
      console.log("WebSocket connected");
      retryCount = 0;
    };

    socket.onclose = () => {
      if (retryCount < MAX_RETRIES) {
        const retryTimeout = Math.pow(2, retryCount) * 1000; // 지수 백오프 적용
        console.log(
          `WebSocket disconnected. Reconnecting in ${
            retryTimeout / 1000
          } seconds...`
        );
        retryCount++;
        setTimeout(connectWebSocket, retryTimeout); // 재연결 시도
      } else {
        console.log("Max retries reached. No further reconnection attempts.");
      }
    };

    socket.onerror = (e) => {
      console.log("WebSocket error:", e);
    };

    window.onbeforeunload = () => {
      socket.close();
    };
  };

  const sendMessage = () => {};

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close(); // 컴포넌트 언마운트 시 WebSocket 종료
      }
    };
  }, [deviceIdRef.current]);

  useEffect(() => {
    //위치 정보를 이용해 날씨 정보 받아오기
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      getWeather(lat, lon);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        if (prev + 1 > 6 * 60) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const showNextImage = useCallback(() => {
    const container = document.getElementById("container");

    if (resources.length > 0 && container) {
      const resource = resources[currentIndex];

      if (!resource) {
        console.error("Invalid resource at index:", currentIndex);
        window.location.reload();
        return;
      }

      // 일정 시간 후에 새로운 이미지나 비디오를 페이드 인
      setTimeout(() => {
        // 새로운 이미지 또는 비디오 요소 생성
        let newElement;

        if (resource.resourceType === "IMAGE") {
          newElement = document.createElement("img");
          newElement.alt = "이미지 로딩 오류";
          newElement.src = resource.filePath;
        } else if (resource.resourceType === "VIDEO") {
          newElement = document.createElement("video");
          newElement.autoplay = true;

          console.log("elapsedTime", elapsedTime);
          if (elapsedTime < 5 * 60 + 30) {
            console.log("elapsedTimemuted");
            newElement.muted = true;
          }
          newElement.src = resource.filePath;

          // 동영상이 로드된 후에 재생을 시도합니다.
          newElement.onloadeddata = () => {
            newElement.play().catch((error) => {
              console.error("동영상 재생 오류:", error);
            });
          };
        }

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
    if (resources.length > 0) {
      showNextImage();
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [resources, showNextImage]);

  //현재 시간 표시
  useEffect(() => {
    const timeId = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(timeId);
    };
  });

  const tick = () => {
    const newDate = new Date();

    // 날짜 비교
    if (
      date.getDate() !== newDate.getDate() ||
      date.getMonth() !== newDate.getMonth() ||
      date.getFullYear() !== newDate.getFullYear()
    ) {
      loadNotice(deviceIdRef.current);
    }

    setDate(newDate);
  };

  const getWeather = async (lat, lon) => {
    const apiKey = process.env.REACT_APP_WEATHER_KEY;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      ).then((response) => {
        return response.json();
      });

      console.log("res: ", res);

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

  if (loading) {
    return <></>;
  }

  return (
    <div>
      {verification === true ? (
        <div>
          <div
            id="container"
            className="h-full w-full fixed left-0 top-0 bg-black flex items-center justify-center align-middle"
          ></div>

          <div className="h-1/12 w-full bg-gray-300/30 flex items-center fixed left-0 bottom-0">
            <div className="flex-auto text-center w-1/12 mr-5">
              <div className="flex">
                <img
                  className="m-auto"
                  src={weather.icon}
                  alt="이미지를 불러올 수 없습니다."
                />
                <div className="m-auto text-4xl font-bold text-black">
                  {weather.temp}℃
                </div>
              </div>
            </div>

            <div className="overflow-hidden flex-auto w-10/12">
              <div
                ref={scrollRef}
                className="notice-text"
                style={{
                  animation: `flow ${animationDuration}s linear infinite`,
                }} // 속도를 동적으로 설정
              >
                <span className="text-5xl font-bold text-black">
                  {combinedNotices}
                </span>
              </div>
            </div>

            <div className="flex-auto text-center w-1/12 text-3xl font-bold text-black">
              {date.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default SignagePlayKeyPage;
