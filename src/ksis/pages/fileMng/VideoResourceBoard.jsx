import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  VIDEO_RESOURCE_BOARD,
  IMAGE_RESOURCE_BOARD,
  VIDEO_ENCODING,
} from "../../../constants/page_constant";
import {
  ACTIVE_RSVIDEO_BOARD,
  FILE_ORIGINAL_BASIC,
  FILE_DEACTIVION,
} from "../../../constants/api_constant";
import { format, parseISO } from "date-fns";
import VideoResourceModal from "./VideoResourceModal";

import OriginCard from "../../components/file/OriginCard";

import fetcher from "../../../fetcher";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import TabButton from "../../components/TapButton";

import SearchBar from "../../components/SearchBar";

const VideoResourceBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("fileTitle");
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [videos, setVideos] = useState([]);
  const [editingTitleIndex, setEditingTitleIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const postsPerPage = 16;
  const navigate = useNavigate();

  const [resourceModalIsOpen, setResourceModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // 선택한 영상의 정보를 관리하는 상태값 추가
  const [startTime, setStartTime] = useState(); // 검색 시작기간
  const [endTime, setEndTime] = useState(); // 검색 시작기간
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

  // 영상 목록을 가져오는 부분
  useEffect(() => {
    fetcher
      .get(ACTIVE_RSVIDEO_BOARD, {
        params: {
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory, // 카테고리 검색에 필요한 필드
          startTime,
          endTime,
        },
      })
      .then((response) => {
        setTotalPages(response.data.totalPages);
        setVideos(response.data.content); // 영상 데이터를 설정
      })
      .catch((error) => {
        console.error("Error fetching video:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, searchTerm, startTime, endTime]);

  useEffect(() => {
    let filtered = videos;

    if (searchTerm) {
      if (searchCategory === "title") {
        filtered = videos.filter((video) =>
          video.fileTitle.includes(searchTerm)
        ); // title -> fileTitle로 수정
      } else if (searchCategory === "regDate") {
        filtered = videos.filter((video) =>
          formatDate(video.regTime).includes(searchTerm)
        ); // 등록일 포맷팅 적용
      } else {
        filtered = videos.filter(
          (video) =>
            video.fileTitle.includes(searchTerm) ||
            formatDate(video.regTime).includes(searchTerm) // 등록일 포맷팅 적용
        );
      }
    }
  }, [videos, searchTerm, searchCategory]);

  const handleEditClick = (index, title) => {
    setEditingTitleIndex(index);
    setNewTitle(title);
  };

  // 엔터 키로 제목 저장
  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSaveClick(id);
    }
  };

  // 제목 수정
  const handleSaveClick = async (id) => {
    showAlert("정말로 파일의 제목을 변경하시겠습니까?", async () => {
      try {
        await fetcher.put(`${FILE_ORIGINAL_BASIC}/${id}`, {
          fileTitle: newTitle, // newTitle을 JSON 형태로 보냄
        });

        // 제목이 변경된 후 videos 상태를 업데이트
        const updatedVideos = videos.map((video) =>
          video.originalResourceId === id
            ? { ...video, fileTitle: newTitle }
            : video
        );
        setVideos(updatedVideos);

        setEditingTitleIndex(null);
        setNewTitle("");
      } catch (error) {
        showAlert("수정에 실패했습니다.", () => {});
        console.error("제목 수정 중 오류 발생:", error);
      }
    });
  };

  // 삭제 핸들러
  const handleDeactivate = async (id) => {
    showAlert("정말로 이 영상을 비활성화하시겠습니까?", async () => {
      try {
        await fetcher.post(FILE_DEACTIVION + `/${id}`);

        const updatedVideos = videos.filter(
          (video) => video.originalResourceId !== id
        );
        setVideos(updatedVideos);
        setTotalPages(Math.ceil(updatedVideos.length / postsPerPage)); // 페이지 수 업데이트
        showAlert("영상을 비활성화하였습니다.", () => {});
      } catch (err) {
        console.error("영상 비활성화 오류:", err);
        showAlert("영상 비활성화에 실패했습니다.", () => {});
      }
    });
  };

  // 유효한 날짜 포맷으로 변환
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  };

  // 모달 열기 함수 수정
  const openResourceModal = (video) => {
    setSelectedVideo(video); // 선택된 영상을 설정합니다.
    setResourceModalIsOpen(true); // 모달을 엽니다.
  };

  const closeResourceModal = () => {
    setResourceModalIsOpen(false);
    setSelectedVideo(null); // 모달을 닫을 때 선택된 영상을 초기화합니다.
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
            alertMessage === "수정에 실패했습니다." ||
            alertMessage === "영상을 비활성화하였습니다." ||
            alertMessage === "영상 비활성화에 실패했습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        영상 원본 페이지
      </h1>

      <SearchBar
        onSearch={(term, category, start, end) => {
          setSearchTerm(term);
          setSearchCategory(category);
          setStartTime(start);
          setEndTime(end);
          setCurrentPage(1); // 검색 시 첫 페이지로 이동
        }}
        searchOptions={[
          { value: "fileTitle", label: "제목" },
          { value: "regTime", label: "등록일", onlyDate: true },
          { value: "resolution", label: "해상도" },
        ]}
        defaultCategory="fileTitle"
      />

      {/* 탭버튼 */}
      <div className="flex justify-end mb-4">
        <div className="w-auto flex space-x-2">
          <TabButton
            label="이미지"
            path={IMAGE_RESOURCE_BOARD}
            isActive={location.pathname === IMAGE_RESOURCE_BOARD}
            onClick={() => navigate(IMAGE_RESOURCE_BOARD)}
          />
          <TabButton
            label="영상"
            path={VIDEO_RESOURCE_BOARD}
            isActive={location.pathname === VIDEO_RESOURCE_BOARD}
            onClick={() => navigate(VIDEO_RESOURCE_BOARD)}
          />
        </div>
      </div>

      {/* 그리드 시작 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {videos.length > 0 ? (
          videos.map((file, index) => (
            <OriginCard
              key={file.originalResourceId}
              file={{ ...file, index }} // index를 props로 전달
              openResourceModal={openResourceModal} // 함수를 전달
              onEditClick={handleEditClick}
              handleSaveClick={handleSaveClick}
              editingTitleIndex={editingTitleIndex}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              handleDeactivate={handleDeactivate}
              onclick={openResourceModal}
              showPlayIcon={true} // 영상 페이지에서만 아이콘을 표시하도록 설정
              encodingPath={VIDEO_ENCODING}
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

      {/* 모달 컴포넌트 호출 */}
      {selectedVideo && (
        <VideoResourceModal
          isOpen={resourceModalIsOpen}
          onRequestClose={closeResourceModal}
          originalResourceId={selectedVideo} // 선택한 영상의 정보를 전달합니다.
        />
      )}
    </div>
  );
};

export default VideoResourceBoard;
