import { useState, useEffect } from "react";
import fetcher from "../../../fetcher";
import { RESOLUTION } from "../../../constants/api_constant";
import ResolutionAddModal from "./ResolutionAddModal";
import ResolutionUpdateModal from "./ResolutionUpdateModal";

import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import ButtonComponentB from "../../components/ButtonComponentB";
import ButtonComponent from "../../components/ButtonComponent";
import SearchBar from "../../components/SearchBar";
import CheckboxTable from "../../components/CheckboxTable";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const ResolutionList = () => {
  const [resolutions, setResolutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("name");
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const checked = true;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const [selectUpdate, setSelectUpdate] = useState(null);
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const openUpdateModal = (resolutionId) => {
    setSelectUpdate(resolutionId);
    setUpdateModalIsOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalIsOpen(false);
    setSelectUpdate(null);
  };

  const postsPerPage = 15;

  const loadPage = async () => {
    try {
      const response = await fetcher.get(RESOLUTION + "/all", {
        params: {
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory,
        },
      });
      if (response.data.content) {
        setResolutions(response.data.content);
        setTotalPages(response.data.totalPages);

        setLoading(false);
      } else {
        console.error("No data property in response");
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [currentPage, searchTerm]);

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const deleteResolution = async (e) => {
    try {
      if (selectedPosts.size === 0) {
        showAlert("삭제할 해상도를 선택해주세요.", () => {});
        return;
      } else {
        showAlert("삭제하시겠습니까?", async () => {
          const queryString = Array.from(selectedPosts).join(",");
          const response = await fetcher.delete(
            RESOLUTION + "?resolutionIds=" + queryString
          );
          console.log(response.data);
          setResolutions((prevresolution) =>
            prevresolution.filter(
              (resolution) => !selectedPosts.has(resolution.resolutionId)
            )
          );
          showAlert("해상도가 정상적으로 삭제되었습니다.", () => {});
        });
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const handleModalClose = async () => {
    await loadPage();
    closeModal();
  };

  const handleUpdateModalClose = async () => {
    await loadPage();
    closeUpdateModal();
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
          if (
            alertMessage === "이미지/영상이 추가되었습니다." &&
            confirmAction
          ) {
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
            alertMessage === "삭제할 해상도를 선택해주세요." ||
            alertMessage === "해상도가 정상적으로 삭제되었습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        해상도 관리
      </h1>

      <SearchBar
        onSearch={(term, category) => {
          setSearchTerm(term);
          setSearchCategory(category);
          setCurrentPage(1);
        }}
        searchOptions={[
          { value: "name", label: "이름" },
          { value: "width", label: "가로" },
          { value: "height", label: "세로" },
        ]}
        defaultCategory="name"
      />

      <div className="shadow-sm ring-1 ring-gray-900/5 text-center px-8 py-10 bg-white rounded-sm h-170">
        <CheckboxTable
          headers={["이름", "가로 X 세로(px)", ""]}
          data={resolutions}
          dataKeys={[
            {
              content: (item) => item.name,
              className: "text-gray-800 text-center border-b border-gray-300",
            },
            {
              content: (item) => item.width + "x" + item.height,
              className: "text-gray-800 text-center border-b border-gray-300",
            },
          ]}
          uniqueKey="resolutionId"
          selectedItems={selectedPosts}
          setSelectedItems={setSelectedPosts}
          check={checked}
          widthPercentage={12 / 4}
          renderActions={(item) => (
            <ButtonComponent
              onClick={() => openUpdateModal(item.resolutionId)}
              color="blue"
            >
              수정
            </ButtonComponent>
          )}
        />
      </div>

      <div className="flex justify-end space-x-2 my-10">
        <ButtonComponentB color="blue" onClick={openModal}>
          해상도 등록
          <ResolutionAddModal
            isOpen={modalIsOpen}
            onRequestClose={handleModalClose}
          />
        </ButtonComponentB>

        <ButtonComponentB onClick={deleteResolution} color="red">
          삭제
        </ButtonComponentB>
      </div>

      {selectUpdate && (
        <ResolutionUpdateModal
          isOpen={updateModalIsOpen}
          onRequestClose={handleUpdateModalClose}
          resolutionId={selectUpdate}
        />
      )}

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

export default ResolutionList;
