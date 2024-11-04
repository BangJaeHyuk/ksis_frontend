import React, { useState, useEffect } from "react";
import fetcher from "../../../fetcher";
import { ImCross } from "react-icons/im";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import {
  IMAGE_FILE_BOARD,
  VIDEO_FILE_BOARD,
} from "../../../constants/page_constant";
import {
  ECVIDEO_BOARD,
  FILE_ENCODED_BASIC,
} from "../../../constants/api_constant";

import EncodedCard from "../../components/file/EncodedCard";

import Loading from "../../components/Loading";
import SearchBar from "../../components/SearchBar";
import PaginationComponent from "../../components/PaginationComponent";
import TabButton from "../../components/TapButton";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const VideoFileBoard = () => {
  // 페이지네이션 관련 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("fileTitle");
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState(1);

  const [isOriginal, setIsOriginal] = useState(true); // 토글 상태 관리
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingTitleIndex, setEditingTitleIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const postsPerPage = 16; // 페이지당 게시물 수

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
      .get(ECVIDEO_BOARD, {
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
        await fetcher.put(`${FILE_ENCODED_BASIC}/${id}`, {
          fileTitle: newTitle, // newTitle을 JSON 형태로 보냄
        });

        // 제목이 변경된 후 videos 상태를 업데이트
        const updatedVideos = videos.map((video) =>
          video.encodedResourceId === id
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

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    showAlert("정말로 이 영상을 삭제하시겠습니까?", async () => {
      try {
        await fetcher.delete(FILE_ENCODED_BASIC + `/${id}`);
        const updatedVideos = videos.filter(
          (video) => video.encodedResourceId !== id
        );

        setVideos(updatedVideos);
        setTotalPages(Math.ceil(updatedVideos.length / postsPerPage)); // 페이지 수 업데이트
        showAlert("영상을 삭제하였습니다.", () => {});
      } catch (err) {
        console.error("영상 삭제 오류:", err);
        showAlert("영상 삭제에 실패했습니다.", () => {});
      }
    });
  };
  const openResourceModal = (src) => {
    setSelectedVideo(src);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedVideo("");
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
            alertMessage === "영상 삭제에 실패했습니다." ||
            alertMessage === "영상을 삭제하였습니다." ||
            alertMessage === "수정에 실패했습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        영상 인코딩 페이지
      </h1>

      <SearchBar
        onSearch={(term, category) => {
          setSearchTerm(term);
          setSearchCategory(category);
          setCurrentPage(1); // 검색 시 첫 페이지로 이동
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
            path={IMAGE_FILE_BOARD}
            isActive={location.pathname === IMAGE_FILE_BOARD}
            onClick={() => navigate(IMAGE_FILE_BOARD)}
          />
          <TabButton
            label="영상"
            path={VIDEO_FILE_BOARD}
            isActive={location.pathname === VIDEO_FILE_BOARD}
            onClick={() => navigate(VIDEO_FILE_BOARD)}
          />
        </div>
      </div>

      {/* 그리드 시작 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {videos.length > 0 ? (
          videos.map((file, index) => (
            <EncodedCard
              key={file.encodedResourceId}
              file={{ ...file, index }} // index를 props로 전달
              openResourceModal={openResourceModal} // 함수를 전달
              onEditClick={handleEditClick}
              handleSaveClick={handleSaveClick}
              editingTitleIndex={editingTitleIndex}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              handleDelete={handleDelete}
              onclick={openResourceModal}
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

      {/* 모달창 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeModal}
        >
          <div
            className="relative mx-auto rounded-lg max-w-3xl w-full h-auto max-h-[80vh]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <video
              src={selectedVideo}
              alt="파일이 없습니다."
              className="w-full h-full max-h-[80vh] bg-white text-center text-gray-500"
              controls // 비디오 컨트롤러 추가
            />
            {/* 닫기 버튼 */}

            <ImCross
              className="absolute -top-2 -right-2 text-white cursor-pointer bg-red-500 rounded-full 
           size-6 hover:scale-110"
              onClick={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFileBoard;
