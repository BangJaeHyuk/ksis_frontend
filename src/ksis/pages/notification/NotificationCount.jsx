import React, { useEffect, useState } from "react";
import { BiBell } from "react-icons/bi";
import fetcher from "../../../fetcher";
import {
  NOTIFICATION_COUNT,
  WEBSOCKET_NOTIFICATION,
} from "../../../constants/api_constant";

const NotificationCountComponent = () => {
  const API_WS_URL = process.env.REACT_APP_API_WS_URL;
  const [unreadCount, setUnreadCount] = useState(0);
  let socket; // WebSocket 변수

  const MAX_RETRIES = 5;
  let retryCount = 0;

  // 알림 개수를 서버로부터 가져오는 함수
  const fetchUnreadCount = async () => {
    try {
      const response = await fetcher.get(NOTIFICATION_COUNT);
      setUnreadCount(response.data);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // WebSocket 연결 함수
  const connectWebSocket = () => {
    const token = localStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰 가져오기
    socket = new WebSocket(
      API_WS_URL + WEBSOCKET_NOTIFICATION + `?token=${token}`
    ); // WebSocket 연결

    // WebSocket 연결이 열리면 실행
    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    // 서버로부터 메시지를 받으면 알림 개수를 다시 가져옴
    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      fetchUnreadCount(); // 알림 개수 다시 가져오기
    };

    // WebSocket 오류 처리
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // WebSocket 연결이 닫혔을 때 처리
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
  };

  useEffect(() => {
    fetchUnreadCount(); // 컴포넌트 마운트 시 처음으로 알림 개수를 가져옴
    connectWebSocket(); // WebSocket 연결

    // 컴포넌트 언마운트 시 WebSocket 연결 종료
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      <BiBell size={16} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationCountComponent;
