import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import fetcher from "../../../fetcher";
import { NOTICE_FORM, NOTICE_DTL } from "../../../constants/page_constant";
import { NOTICE_ALL, DEACTIVE_NOTICE } from "../../../constants/api_constant";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { decodeJwt } from "../../../decodeJwt";

import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import ButtonComponentB from "../../components/ButtonComponentB";
import SearchBar from "../../components/SearchBar";
import CheckboxTable from "../../components/CheckboxTable";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const NoticeBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title"); // "fileTitle" 대신 "title"로 수정
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState(1);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotices, setSelectedNotices] = useState(new Set());

  const checked = true;
  const postsPerPage = 15;
  const navigate = useNavigate();

  const authority = decodeJwt().roles;

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  useEffect(() => {
    console.log(authority);
    const fetchNotices = async () => {
      try {
        const response = await fetcher.get(NOTICE_ALL, {
          params: {
            page: currentPage - 1,
            size: postsPerPage,
            searchTerm,
            searchCategory,
          },
        });
        setNotices(response.data.content);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("데이터를 가져오는 데 실패했습니다.");
        console.log(err);
      } finally {
      }
    };

    fetchNotices();
  }, [currentPage, searchTerm, searchCategory]); // searchCategory 추가

  const filteredNotices = useMemo(() => {
    // notices가 undefined일 경우 빈 배열로 초기화
    const validNotices = notices || [];

    return validNotices
      .filter((notice) =>
        notice[searchCategory]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
        if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
        return 0;
      });
  }, [notices, searchTerm, searchCategory]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleRegisterClick = () => {
    navigate(NOTICE_FORM); // 공지글 등록 페이지로 이동
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>오류 발생: {error}</p>;
  }

  const getDeviceNames = (deviceList) => {
    if (!deviceList || deviceList.length === 0) {
      return "";
    }
    const deviceNames = deviceList.map((device) => device.deviceName);
    return deviceNames.join(", ");
  };

  const handleDectivation = async () => {
    if (selectedNotices.size === 0) {
      showAlert("선택한 공지가 없습니다.", () => {});
      return;
    }

    showAlert("선택한 공지를 비활성화하시겠습니까?", async () => {
      try {
        const deletePromises = [...selectedNotices].map((id) =>
          fetcher.post(`${DEACTIVE_NOTICE}/${id}`)
        );

        await Promise.all(deletePromises);
        setNotices(
          notices.filter((notice) => !selectedNotices.has(notice.noticeId))
        );
        setSelectedNotices(new Set());
        showAlert("선택한 공지를 비활성화하였습니다.", () => {});
      } catch (err) {
        console.error("공지 비활성화 오류:", err);
        showAlert("공지 비활성화에 실패했습니다.", () => {});
      }
    });
  };

  return (
    <div className="mx-auto whitespace-nowrap py-6 px-10">
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
        }}
        size="lg"
      >
        <AlertTitle>알림창</AlertTitle>
        <AlertDescription>{alertMessage}</AlertDescription>
        <AlertActions>
          {confirmAction && (
            <Button
              onClick={() => {
                setIsAlertOpen(false);
                if (confirmAction) confirmAction(); // 확인 버튼 클릭 시 지정된 액션 수행
              }}
            >
              확인
            </Button>
          )}
          {!(
            alertMessage === "선택한 공지를 비활성화하였습니다." ||
            alertMessage === "공지 비활성화에 실패했습니다." ||
            alertMessage === "선택한 공지가 없습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        공지글 관리
      </h1>

      <SearchBar
        onSearch={(term, category) => {
          setSearchTerm(term);
          setSearchCategory(category);
          setCurrentPage(1);
        }}
        searchOptions={[
          { value: "title", label: "제목" },
          ...(authority === "ROLE_ADMIN"
            ? [{ value: "account", label: "작성자" }]
            : []),
          { value: "regTime", label: "등록일" },
        ]}
        defaultCategory="title"
      />

      <div className="shadow-sm ring-1 ring-gray-900/5 text-center px-8 py-10 bg-white rounded-sm h-170">
        {filteredNotices.length === 0 ? (
          <p className="text-center text-gray-600 mt-10 w-full">
            공지글이 없습니다.
          </p>
        ) : (
          <CheckboxTable
            headers={["제목", "작성자(아이디)", "작성일", "재생장치"]}
            data={filteredNotices}
            dataKeys={[
              {
                content: (item) => (
                  <Link to={NOTICE_DTL + `/${item.noticeId}`}>
                    {item.role === "ADMIN" && authority === "ROLE_ADMIN"
                      ? "📢 "
                      : ""}
                    {item.title}
                  </Link>
                ),
                className:
                  "p-2 text-center border-b border-gray-300 text-[#444444] font-semibold hover:underline",
              },
              {
                content: (item) => item.name + "(" + item.accountId + ")",
                className:
                  "p-2 text-gray-800 text-center border-b border-gray-300",
              },
              {
                content: (item) => format(item.regDate, "yyyy-MM-dd"),
                className:
                  "p-2 text-gray-800 text-center border-b border-gray-300",
              },
              {
                content: (item) => getDeviceNames(item.deviceList),
                className:
                  "p-2 text-gray-800 text-center border-b border-gray-300",
              },
            ]}
            uniqueKey="noticeId"
            selectedItems={selectedNotices}
            setSelectedItems={setSelectedNotices}
            check={checked}
            authority={authority}
            widthPercentage={12 / 4}
          />
        )}
      </div>

      <div className="flex justify-end space-x-2 my-10">
        <ButtonComponentB onClick={handleRegisterClick} color="blue">
          공지글 등록
        </ButtonComponentB>

        <ButtonComponentB onClick={handleDectivation} color="red">
          비활성화
        </ButtonComponentB>
      </div>

      <div>
        <PaginationComponent
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default NoticeBoard;
