import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import {
  VIDEO_FILE_BOARD,
  IMAGE_FILE_BOARD,
} from "../../../constants/page_constant";
import {
  ECIMAGE_BOARD,
  FILE_ENCODED_BASIC,
} from "../../../constants/api_constant";
import fetcher from "../../../fetcher";
import EncodedCard from "../../components/file/EncodedCard";
import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import TabButton from "../../components/TapButton";
import SearchBar from "../../components/SearchBar";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const ImageFileBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("fileTitle");
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState(1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTitleIndex, setEditingTitleIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const postsPerPage = 16;

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
      .get(ECIMAGE_BOARD, {
        params: {
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory, // 카테고리 검색에 필요한 필드
        },
      })
      .then((response) => {
        setTotalPages(response.data.totalPages);
        setImages(response.data.content);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }, [currentPage, searchTerm]);

  const handleEditClick = (index, title) => {
    setEditingTitleIndex(index);
    setNewTitle(title);
  };

  const handleSaveClick = async (id) => {
    showAlert("정말로 파일의 제목을 변경하시겠습니까?", async () => {
      try {
        await fetcher.put(`${FILE_ENCODED_BASIC}/${id}`, {
          fileTitle: newTitle,
        });

        const updatedImages = images.map((image) =>
          image.encodedResourceId === id
            ? { ...image, fileTitle: newTitle }
            : image
        );
        setImages(updatedImages);

        setEditingTitleIndex(null);
        setNewTitle("");
      } catch (error) {
        showAlert("수정에 실패했습니다.", () => {});
        console.error("제목 수정 중 오류 발생:", error);
      }
    });
  };
  // 엔터 키로 제목 저장
  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSaveClick(id);
    }
  };

  const handleDelete = async (id) => {
    showAlert("정말로 이 이미지를 삭제하시겠습니까?", async () => {
      try {
        await fetcher.delete(`${FILE_ENCODED_BASIC}/${id}`);
        const updatedImages = images.filter(
          (image) => image.encodedResourceId !== id
        );
        setImages(updatedImages);
        setTotalPages(Math.ceil(updatedImages.length / postsPerPage)); // 페이지 수 업데이트
        showAlert("이미지를 삭제하였습니다.", () => {});
      } catch (err) {
        console.error("이미지 삭제 오류:", err);
        showAlert("이미지 삭제에 실패했습니다.", () => {});
      }
    });
  };

  const openResourceModal = (image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImage("");
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
            alertMessage === "이미지를 삭제하였습니다." ||
            alertMessage === "이미지 삭제에 실패했습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        이미지 인코딩 페이지
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
        {images.length > 0 ? (
          images.map((file, index) => (
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
              showPlayIcon={false}
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
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        >
          <div
            className="relative mx-auto rounded-lg max-w-3xl w-full h-auto max-h-[80vh]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <img
              src={selectedImage}
              alt="파일이 없습니다."
              className="w-full h-full max-h-[80vh] bg-white text-center text-gray-500"
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

export default ImageFileBoard;
