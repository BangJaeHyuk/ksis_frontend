import React from "react";
import { FaRegPlayCircle } from "react-icons/fa";
import { format, parseISO } from "date-fns";
import ButtonComponentB from "../../components/ButtonComponentB";

const OriginCard = ({
  file,
  handleActivation,
  showPlayIcon, // 영상 페이지에서만 아이콘을 보이게 하기 위한 prop
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
              className="w-full h-full object-cover object-center"
            />
            {/* 아이콘 추가 */}
            {showPlayIcon && (
              <FaRegPlayCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-8xl opacity-85" />
            )}
          </div>
        </div>

        {/* 제목 및 아이콘 래퍼 */}
        <div className="flex justify-between w-full">
          <h2
            className="pl-4 text-xl font-bold truncate max-w-full mx-auto justify-start
             text-gray-800"
            title={file.fileTitle}
          >
            {file.fileTitle}
          </h2>
        </div>

        {/* 등록일 */}
        <div className="mx-auto">
          <p className="text-gray-500">{formatDate(file.regTime)}</p>
        </div>

        {/* 삭제 버튼 */}
        <div className="flex justify-center p-2">
          <ButtonComponentB
            onClick={() => handleActivation(file.originalResourceId)}
            color="blue"
          >
            활성화
          </ButtonComponentB>
        </div>
      </div>
    </div>
  );
};

export default OriginCard;
