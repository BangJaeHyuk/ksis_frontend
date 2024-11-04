import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../css/alert";
import { Button } from "../css/button";

const SearchBar = ({
  onSearch, // 검색 이벤트 핸들러
  searchOptions = [], // 검색 옵션 배열
  defaultCategory = "", // 기본 선택된 검색 카테고리
  selectOptions = {}, // 특정 카테고리에 사용할 select 옵션\
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState(defaultCategory);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const currentOption = searchOptions.find(
    (option) => option.value === searchCategory
  );

  const handleSearch = () => {
    // 검색 버튼 클릭 시 상위 컴포넌트에 검색어와 카테고리 전달
    if (currentOption.useDate) {
      onSearch(searchTerm, searchCategory, startTime, endTime);
    } else if (currentOption.onlyDate) {
      if (!startTime || !endTime) {
        showAlert("검색 범위를 설정해주세요.", () => {});
        return;
      }
      onSearch(searchTerm, searchCategory, startTime, endTime);
    } else {
      onSearch(searchTerm, searchCategory);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSearchCategory(newCategory);
    setSearchTerm("");
    setStartTime("");
    setEndTime("");

    if (selectOptions[newCategory]) {
      onSearch(
        "",
        newCategory,
        currentOption.useDate ? startTime : undefined,
        currentOption.useDate ? endTime : undefined
      );
    }
  };

  const handleSelectChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(
      e.target.value,
      searchCategory,
      currentOption.useDate ? startTime : undefined,
      currentOption.useDate ? endTime : undefined
    );
  };

  const handleDateChange = (e, setDate) => {
    setDate(e.target.value);
  };

  const handleDateChangeAndSearch = (e, setDate) => {
    setDate(e.target.value);
    onSearch(searchTerm, searchCategory, startTime, endTime);
  };

  return currentOption.onlyDate ? (
    // onlyDate가 true일 때 전용 UI
    <div className="flex items-center relative flex-grow border-gray-300 my-10">
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
          {!(alertMessage === "검색 범위를 설정해주세요.") && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <select
        value={searchCategory}
        onChange={handleCategoryChange}
        className="p-2 bg-white text-[#444444] font-bold border border-gray-300"
      >
        {searchOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex items-center mx-2">
        <input
          type="date"
          value={startTime}
          onChange={(e) => handleDateChange(e, setStartTime)}
          className="p-2 border border-gray-300 mx-1"
        />
        <span>~</span>
        <input
          type="date"
          value={endTime}
          onChange={(e) => handleDateChange(e, setEndTime)}
          className="p-2 border border-gray-300 mx-1"
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-[#FF9C00] border border-[#FF9C00] text-white h-10 w-10 inline-flex items-center text-center"
      >
        <FaSearch className=" w-full" />
      </button>
    </div>
  ) : selectOptions[searchCategory] ? (
    // select 박스와 자동 검색
    <div className="flex items-center relative flex-grow border-gray-300 my-10">
      <select
        value={searchCategory}
        onChange={handleCategoryChange}
        className="p-2 bg-white text-[#444444] font-bold border border-gray-300"
      >
        {searchOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* 날짜 선택 (useDate가 true인 경우에만) */}
      {currentOption.useDate && (
        <div className="flex items-center mx-2">
          <input
            type="date"
            value={startTime}
            onChange={(e) => handleDateChangeAndSearch(e, setStartTime)}
            className="p-2 border border-gray-300 mx-1"
          />
          <span>~</span>
          <input
            type="date"
            value={endTime}
            onChange={(e) => handleDateChangeAndSearch(e, setEndTime)}
            className="p-2 border border-gray-300 mx-1"
          />
        </div>
      )}
      <div className="relative flex-grow">
        <select
          value={searchTerm}
          onChange={handleSelectChange} // 선택 시 자동으로 검색 실행
          className="ml-2 p-2 border border-gray-300 rounded-md flex-grow"
        >
          {selectOptions[searchCategory].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  ) : (
    <div className="flex items-center relative flex-grow border-y border-gray-300 my-10">
      <select
        value={searchCategory}
        onChange={handleCategoryChange}
        className="p-2 bg-white text-[#444444] font-bold border-x border-gray-300"
      >
        {searchOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* 날짜 선택 (useDate가 true인 경우에만) */}
      {currentOption.useDate && (
        <div className="flex items-center mx-2">
          <input
            type="date"
            value={startTime}
            onChange={(e) => handleDateChange(e, setStartTime)}
            className="p-1 mx-1"
          />
          <span>~</span>
          <input
            type="date"
            value={endTime}
            onChange={(e) => handleDateChange(e, setEndTime)}
            className="p-1 mx-1"
          />
        </div>
      )}
      <div className="relative flex-grow">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full border-x border-gray-300 p-2 pr-10"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-[#FF9C00] border-x border-[#FF9C00] text-white h-10 w-10 inline-flex items-center text-center"
      >
        <FaSearch className=" w-full" />
      </button>
    </div>
  );
};

export default SearchBar;
