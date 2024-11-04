import React, { useState, useEffect } from "react";
import fetcher from "../../../fetcher";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import {
  TRASH_IMAGE_FILE,
  TRASH_VIDEO_FILE,
} from "../../../constants/page_constant";
import {
  DEACTIVE_VIDEO_BOARD,
  FILE_ACTIVE,
} from "../../../constants/api_constant";

import TrashCard from "../../components/file/TrashCard";

import SearchBar from "../../components/SearchBar";
import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import TabButton from "../../components/TapButton";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const TrashVideoFileBoard = () => {
  const [loading, setLoading] = useState(true);

  // 페이지네이션 관련 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("fileTitle");
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState(1);

  const [videos, setVideos] = useState([]);

  const postsPerPage = 16; // 페이지당 게시물 수
  const navigate = useNavigate();
  const location = useLocation();

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
    fetcher
      .get(DEACTIVE_VIDEO_BOARD, {
        params: {
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory, // 카테고리 검색에 필요한 필드
        },
      })
      .then((response) => {
        setTotalPages(response.data.totalPages);
        setVideos(response.data.content);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, [currentPage, searchTerm]);

  const handleActivation = async (id) => {
    showAlert("정말로 이 영상을 활성화하시겠습니까?", async () => {
      try {
        await fetcher.post(`${FILE_ACTIVE}/${id}`);
        setVideos(videos.filter((image) => image.originalResourceId !== id));
        showAlert("영상을 활성화하였습니다.", () => {});
      } catch (err) {
        console.error("영상 활성화 오류:", err);
        showAlert("영상 활성화에 실패했습니다.", () => {});
      }
    });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto whitespace-nowrap py-6 px-10">
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (alertMessage === "" && confirmAction) {
            confirmAction(); // 알림창 밖을 클릭해도 확인 액션 수행
          }
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
            alertMessage === "영상을 활성화하였습니다." ||
            alertMessage === "영상 활성화에 실패했습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        비활성화 영상 페이지
      </h1>

      <SearchBar
        onSearch={(term, category) => {
          setSearchTerm(term);
          setSearchCategory(category);
          setCurrentPage(1);
        }}
        searchOptions={[
          { value: "fileTitle", label: "제목" },
          { value: "regTime", label: "등록일" },
          { value: "resolution", label: "해상도" },
        ]}
        defaultCategory="fileTitle"
      />

      {/* 탭버튼 */}
      <div className="flex justify-end mb-4">
        <div className="w-auto flex space-x-2">
          <TabButton
            label="이미지"
            path={TRASH_IMAGE_FILE}
            isActive={location.pathname === TRASH_IMAGE_FILE}
            onClick={() => navigate(TRASH_IMAGE_FILE)}
          />
          <TabButton
            label="영상"
            path={TRASH_VIDEO_FILE}
            isActive={location.pathname === TRASH_VIDEO_FILE}
            onClick={() => navigate(TRASH_VIDEO_FILE)}
          />
        </div>
      </div>

      {/* 그리드 시작 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {videos.length > 0 ? (
          videos.map((file, index) => (
            <TrashCard
              key={file.originalResourceId}
              file={{ ...file, index }} // index를 props로 전달
              handleActivation={handleActivation}
              showPlayIcon={true}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            게시된 파일이 없습니다.
          </div>
        )}
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

export default TrashVideoFileBoard;
