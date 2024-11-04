import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  NOTIFICATION_PAGE,
  NOTIFICATION_ISREAD,
} from "../../../constants/api_constant";
import fetcher from "../../../fetcher";
import {
  IMAGE_FILE_BOARD,
  IMAGE_RESOURCE_BOARD,
  VIDEO_FILE_BOARD,
  VIDEO_RESOURCE_BOARD,
} from "../../../constants/page_constant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../css/table";
import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";

const Notification = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]); // 알림 데이터
  const [page, setPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [pageSize] = useState(10); // 페이지당 알림 개수
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // 데이터베이스에서 알림 데이터 요청
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetcher.get(
          `${NOTIFICATION_PAGE}?page=${page}&size=${pageSize}`
        );
        setNotifications(response.data.content); // 현재 페이지 알림 데이터
        setTotalPages(response.data.totalPages); // 전체 페이지 수 설정

        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications(page); // 컴포넌트가 마운트되면 현재 페이지의 알림을 요청
  }, [page]); // 페이지 변경 시 데이터 다시 요청

  // 알림 눌렀을때 타입에 따라 페이지 이동 메서드
  const handleNavigate = (resourceType, message) => {
    if (resourceType === "IMAGE") {
      if (message.includes("인코딩")) {
        navigate(IMAGE_FILE_BOARD);
      } else {
        navigate(IMAGE_RESOURCE_BOARD);
      }

      onClose();
    } else if (resourceType === "VIDEO") {
      if (message.includes("인코딩")) {
        navigate(VIDEO_FILE_BOARD);
      } else {
        navigate(VIDEO_RESOURCE_BOARD);
      }
      onClose();
    }
  };

  // 마우스를 올려놓으면 알림 읽음표시로 바꾸는 함수
  const handleMouseOver = async (index, notificationId) => {
    try {
      // 클라이언트에서 상태 업데이트
      setNotifications((prevNotifications) => {
        const updatedNotifications = [...prevNotifications];
        updatedNotifications[index].isRead = true;
        return updatedNotifications;
      });

      // 서버에 업데이트 요청
      await fetcher.post(`${NOTIFICATION_ISREAD}/${notificationId}`);
    } catch (error) {
      console.error("Error updating notification: ", error);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setPage(value); // 선택된 페이지로 상태 업데이트
  };

  if (loading) {
    return <></>;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
      onClick={onClose} // 모달 바깥 클릭 시 모달 닫기
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-full w-[700px]"
        onClick={(e) => e.stopPropagation()} // 모달 내용 클릭 시 닫히지 않게
      >
        <h2 className="text-xl font-semibold mb-4">알림</h2>
        <div className="overflow-auto">
          {/* 알림 목록을 테이블로 표시 */}
          <Table grid>
            <TableHead>
              <TableRow>
                <TableHeader className="w-2/3">메시지</TableHeader>
                <TableHeader className="w-1/3">시간</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="2" className="py-2 px-4 text-center">
                    데이터가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification, index) => (
                  <TableRow
                    key={index}
                    className={`${
                      notification.isRead ? "bg-white" : "bg-orange-100"
                    } hover:bg-gray-100 cursor-pointer`}
                    onMouseEnter={() =>
                      handleMouseOver(index, notification.notificationId)
                    }
                    onClick={() =>
                      handleNavigate(
                        notification.resourceType,
                        notification.message
                      )
                    }
                  >
                    <TableCell
                      className="font-bold"
                      title={notification.message}
                    >
                      {notification.message.length > 30
                        ? `${notification.message.slice(
                            0,
                            20
                          )}...${notification.message.slice(-7)}`
                        : notification.message}
                    </TableCell>
                    <TableCell className="font-bold">
                      {new Date(notification.regTime).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <br />
        <div>
          <PaginationComponent
            totalPages={totalPages}
            currentPage={page}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;
