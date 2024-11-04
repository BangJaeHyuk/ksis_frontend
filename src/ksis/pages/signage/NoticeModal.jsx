import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogBody, DialogActions } from "../../css/dialog";
import fetcher from "../../../fetcher";
import { FaSearch } from "react-icons/fa";
import { format } from "date-fns";
import { SIGNAGE_NOTICE } from "../../../constants/api_constant";
import { NOTICE_DTL } from "../../../constants/page_constant";
import { Link } from "react-router-dom";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const NoticeModal = ({ isOpen, onRequestClose, signageId }) => {
  const [notices, setNotices] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title");
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const postsPerPage = 7; // 한 페이지 10개 데이터

  const modalRef = useRef(null);

  const loadPage = async () => {
    try {
      const response = await fetcher.get(SIGNAGE_NOTICE + `/${signageId}`, {
        params: {
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory,
        },
      });
      console.log(response);
      if (response.data) {
        setNotices(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // 검색어 변경 핸들러
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  useEffect(() => {
    if (signageId) {
      loadPage();
    }
  }, [currentPage, searchTerm]);

  const handleClickOutside = (e) => {
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
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onRequestClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span> */}
        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-5/12 sm:p-6 h-128"
        >
          <DialogBody className="h-96">
            <div className="mb-4 flex items-center">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="mr-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="title">제목</option>
                <option value="account">작성자</option>
              </select>
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                />
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-300 border-collapse border border-gray-300 mb-4 text-center">
              <thead>
                <tr>
                  <td className="border border-gray-300">작성자(아이디)</td>
                  <td className="border border-gray-300">제목</td>
                  <td className="border border-gray-300">작성일</td>
                  <td className="border border-gray-300">노출일</td>
                </tr>
              </thead>
              <tbody>
                {notices.map((notice) => (
                  <tr key={notice.noticeId} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">
                      {notice.account.name}({notice.account.accountId})
                    </td>

                    <td className="border border-gray-300 p-2 text-blue-600 font-semibold hover:underline">
                      <Link to={NOTICE_DTL + `/${notice.noticeId}`}>
                        {notice.title}
                      </Link>
                    </td>

                    <td className="border border-gray-300 p-2">
                      {format(notice.regDate, "yyyy-MM-dd")}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {format(notice.startDate, "yyyy-MM-dd")} ~{" "}
                      {format(notice.endDate, "yyyy-MM-dd")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DialogBody>
          <DialogActions className="mt-4">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color={"primary"}
              />
            </Stack>
            {/* <button
              onClick={onRequestClose}
              className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600/70 text-base font-medium text-white shadow-sm hover:bg-red-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              닫기
            </button> */}
          </DialogActions>
        </div>
      </div>
    </Dialog>
  );
};

export default NoticeModal;
