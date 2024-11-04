import React, { useCallback, useEffect, useState, useRef } from "react";
import { Dialog, DialogTitle, DialogBody } from "../../css/dialog";
import fetcher from "../../../fetcher";
import {
  SIGNAGE_ACCOUNT_RESOURCE,
  SIGNAGE_ADD_RESOURCE,
  SIGNAGE_RESOURCE,
} from "../../../constants/api_constant";
import { ImCross } from "react-icons/im";
import { RxCrossCircled } from "react-icons/rx";
import { BsXCircleFill } from "react-icons/bs";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const SignageResourceModal = ({ isOpen, onRequestClose, signageId }) => {
  const modalRef = useRef(null);

  //재생장치의 인코딩리소스 불러오기
  const [resources, setResources] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [addResources, setAddResources] = useState([]);

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const handleClickOutside = (e) => {
    if (isAlertOpen) return; // 알림창이 열려 있을 때는 실행하지 않음
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onRequestClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isAlertOpen]);

  const loadModal = async () => {
    try {
      const [responseResource, responseMyResource] = await Promise.all([
        fetcher.get(SIGNAGE_RESOURCE + `/${signageId}`),
        fetcher.get(SIGNAGE_ACCOUNT_RESOURCE),
      ]);

      setResources(responseResource.data);
      setMyResources(responseMyResource.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isOpen && signageId) {
      loadModal();
    }
  }, [isOpen, signageId]);

  //삭제
  const deleteResource = async (encodedResourceId) => {
    try {
      showAlert("삭제하시겠습니까?", async () => {
        const response = await fetcher.delete(
          SIGNAGE_RESOURCE + `/${signageId}/` + encodedResourceId
        );

        console.log(response.data);

        setResources((prevResources) =>
          prevResources.filter(
            (resource) => resource.encodedResourceId !== encodedResourceId
          )
        );

        setAddResources((prevResources) =>
          prevResources.filter((id) => id !== encodedResourceId)
        );
      });
    } catch (error) {
      console.log(error.response.data);
    }
  };

  //추가
  const addResource = (resource) => {
    // 이미 resources에 존재하면 추가하지 않음
    if (
      resources.some(
        (res) => res.encodedResourceId === resource.encodedResourceId
      )
    ) {
      return;
    }
    setAddResources((prevResources) => [
      ...prevResources,
      resource.encodedResourceId,
    ]);
    setResources((prevResources) => [...prevResources, resource]);
  };

  const addResourceOnClick = async () => {
    try {
      showAlert("저장하시겠습니까?", async () => {
        const formData = new FormData();

        formData.append(
          "encodedResourceIdList",
          new Blob([JSON.stringify(addResources)], { type: "application/json" })
        );

        const postData = await fetcher.post(
          SIGNAGE_ADD_RESOURCE + `/${signageId}`,
          formData
        );

        console.log(postData);

        showAlert("이미지/영상이 추가되었습니다.", () => {
          onRequestClose();
        });
      });
    } catch (error) {
      console.log(error.postData);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onRequestClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
            {alertMessage !== "이미지/영상이 추가되었습니다." && (
              <Button plain onClick={() => setIsAlertOpen(false)}>
                취소
              </Button>
            )}
          </AlertActions>
        </Alert>

        <div
          ref={modalRef}
          className="inline-block align-bottom bg-gray-100 px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-7/12 md:w-7/12 sm:p-6"
        >
          <div className="flex h-160">
            <div className="w-4/6 pr-4">
              <DialogTitle className="text-lg font-medium leading-6 text-gray-900 text-center">
                재생장치 이미지/영상
              </DialogTitle>
              <DialogBody className="mt-2">
                <div className="mb-4 flex items-center">
                  <div className="w-full border h-150 border-gray-900 overflow-y-auto p-4 bg-white">
                    <div className="space-y-2">
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-5">
                        {resources.map((resource) => (
                          <div
                            key={resource.encodedResourceId}
                            className="group relative border border-gray-900 mb-5"
                          >
                            <button
                              className="absolute top-0 right-0 m-2 text-red-500 cursor-pointer"
                              onClick={() =>
                                deleteResource(resource.encodedResourceId)
                              }
                            >
                              <ImCross />
                            </button>
                            <div className="w-full h-full overflow-hidden bg-gray-200 lg:h-60">
                              <img
                                src={resource.thumbFilePath}
                                alt={resource.fileTitle}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="relative group text-gray-700 text-center w-full p-1 bg-white">
                              <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                {resource.fileTitle}
                              </p>

                              <span className="absolute left-0 w-auto p-1 z-10 bg-gray-100 text-sm  opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                {resource.fileTitle}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogBody>
            </div>

            <div className="border-l border-gray-400 pr-4"></div>

            <div className="w-2/6">
              <DialogTitle className="text-lg font-medium leading-6 text-gray-900 text-center">
                내 이미지/영상
              </DialogTitle>
              <DialogBody className="mt-2">
                <div className="mb-4 flex items-center">
                  <div className="w-full h-150 border border-gray-900 overflow-y-auto p-4 bg-white">
                    <div className="space-y-2">
                      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-2 md:gap-y-0 lg:gap-x-8">
                        {myResources.map((resource) => {
                          const isInResources = resources.some(
                            (res) =>
                              res.encodedResourceId ===
                              resource.encodedResourceId
                          );
                          return (
                            <div
                              key={resource.encodedResourceId}
                              className={`group relative border border-gray-900 mb-5 ${
                                isInResources ? "bg-gray-300" : "bg-white"
                              }`}
                            >
                              <div className="w-full h-full overflow-hidden lg:h-60">
                                <img
                                  src={resource.thumbFilePath}
                                  alt={resource.fileTitle}
                                  className="h-full w-full object-cover object-center cursor-pointer"
                                  onClick={() => addResource(resource)}
                                />
                              </div>
                              <div className="relative group text-gray-700 text-center w-full p-1">
                                <p
                                  className={`truncate whitespace-nowrap overflow-hidden text-ellipsis ${
                                    isInResources ? "bg-gray-300" : "bg-white"
                                  }`}
                                >
                                  {resource.fileTitle}
                                </p>

                                <span className="absolute left-0 w-auto p-1 bg-gray-100 text-sm z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                  {resource.fileTitle}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogBody>
              <div className="flex flex-row-reverse">
                <button
                  onClick={onRequestClose}
                  className="rounded-md whitespace-nowrap ml-2 inline-flex justify-center px-4 py-2 bg-[#444444] text-sm text-white hover:bg-gray-200 hover:text-[#444444] font-semibold"
                >
                  닫기
                </button>
                <button
                  onClick={addResourceOnClick}
                  className="rounded-md whitespace-nowrap inline-flex justify-center px-4 py-2 bg-[#FF9C00] text-sm text-white hover:bg-gray-200 hover:text-[#444444] font-semibold"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SignageResourceModal;
