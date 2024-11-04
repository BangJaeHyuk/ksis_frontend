import React from "react";
import { FaEdit, FaRegPlayCircle } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import ButtonComponentB from "../../components/ButtonComponentB";

const OriginCard = ({
  file,
  onEditClick,
  editingTitleIndex,
  newTitle,
  setNewTitle,
  handleSaveClick,
  handleDeactivate,
  openResourceModal,
  showPlayIcon, // 영상 페이지에서만 아이콘을 보이게 하기 위한 prop
  encodingPath, // 인코딩 페이지 경로를 다르게 설정하기 위한 prop
}) => {
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  };

  return (
    <div className="grid p-1">
      <div className="flex flex-col h-full overflow-hidden max-w-xs">
        {/* 이미지 */}
        <div className="w-full h-auto md:h-60 lg:h-70 relative">
          <div className="w-full h-full overflow-hidden relative">
            <img
              src={file.thumbFilePath}
              alt={file.fileTitle}
              className="w-full h-full cursor-pointer object-cover object-center hover:scale-150"
              //이미지 클릭하면 모달 열림
              onClick={() => openResourceModal(file.originalResourceId)}
            />
            {/* 아이콘 추가 */}
            {showPlayIcon && (
              <FaRegPlayCircle
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-8xl cursor-pointer opacity-85"
                onClick={() => openResourceModal(file.originalResourceId)}
              />
            )}
          </div>
        </div>

        {/* 제목 및 아이콘 래퍼 */}
        <div className="flex justify-between w-full">
          {editingTitleIndex === file.index ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="pl-4 w-full text-xl font-medium border-b border-dashed text-center border-gray-400 outline-none transition-colors duration-200 focus:border-gray-600 max-w-full mx-auto justify-start"
              placeholder="제목을 입력해주세요."
              onKeyDown={(e) =>
                e.key === "Enter" && handleSaveClick(file.originalResourceId)
              }
              onBlur={() => handleSaveClick(file.originalResourceId)} // 포커스 아웃 시 저장
            />
          ) : (
            <h2
              className="pl-4 text-xl font-bold truncate max-w-full mx-auto justify-start
             text-gray-800"
              title={file.fileTitle}
              onBlur={() => handleSaveClick(file.originalResourceId)} // 포커스 아웃 시 저장
              onClick={() => onEditClick(file.index, file.fileTitle)}
            >
              {file.fileTitle}
            </h2>
          )}
          <div>
            <FaEdit
              onClick={() =>
                editingTitleIndex === file.index
                  ? handleSaveClick(file.originalResourceId)
                  : onEditClick(file.index, file.fileTitle)
              }
              className="justify-end text-xl cursor-pointer text-gray-600 transition-transform duration-200 transform hover:scale-110 hover:text-gray-800 m-1"
            />
          </div>
        </div>

        {/* 등록일 */}
        <div className="mx-auto">
          <p className="text-gray-500">{formatDate(file.regTime)}</p>
        </div>

        {/* 인코딩, 삭제 버튼 */}
        <div className="items-center text-center row mx-auto p-2">
          <ButtonComponentB
            color="blue"
            to={`${encodingPath}/${file.originalResourceId}`}
          >
            인코딩
          </ButtonComponentB>

          <ButtonComponentB
            onClick={() => handleDeactivate(file.originalResourceId)}
            color="red"
          >
            비활성화
          </ButtonComponentB>
        </div>
      </div>
    </div>
  );
};

export default OriginCard;
