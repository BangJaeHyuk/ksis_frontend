import React, { useCallback, useEffect, useState } from "react"; // React의 훅을 가져옵니다.
import { Dialog } from "../../css/dialog"; // Dialog 컴포넌트를 가져옵니다.
import { ImCross } from "react-icons/im";
import { VIDEO_ORIGINAL_BASIC } from "../../../constants/api_constant"; // 상수를 가져옵니다.
import { format, parseISO } from "date-fns";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import fetcher from "../../../fetcher";

const VideoResourceModal = ({ isOpen, onRequestClose, originalResourceId }) => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const postsPerPage = 5;

  const loadModal = useCallback(async () => {
    fetcher
      .get(VIDEO_ORIGINAL_BASIC + `/${originalResourceId}`, {
        params: {
          page: currentPage - 1,
          size: postsPerPage,
        },
      })
      .then((response) => {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching:", error); // 에러 발생 시 콘솔에 출력합니다.
      });
  }, [currentPage, originalResourceId]); // originalResourceId가 변경될 때마다 함수를 재생성합니다.

  useEffect(() => {
    // 모달이 열리고 originalResourceId가 있을 때 데이터를 로드합니다.
    if (isOpen && originalResourceId) {
      loadModal();
    }
  }, [isOpen, originalResourceId, loadModal]); // 의존성 배열에 따라 실행됩니다.

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={isOpen} onClose={onRequestClose}>
      {" "}
      {/* 모달이 열렸을 때 렌더링됩니다. */}
      <div className="items-center text-center" onClick={onRequestClose}>
        <div className="fixed inset-0 flex items-center justify-center">
          {/* 네모틀 */}
          <div
            className="relative mx-auto rounded-lg w-full h-auto max-w-3xl max-h-[80vh] p-6 bg-white border-gray-400"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {/* 닫기 버튼 */}
            <ImCross
              className="absolute -top-2 -right-2 text-white cursor-pointer bg-red-500 rounded-full size-6 hover:scale-110"
              onClick={onRequestClose}
            />

            {/* 모달 내용 */}

            {posts.length > 0 ? (
              <div className="text-center items-center p-2">
                {/* 첫 번째 이미지만 렌더링 */}
                {posts.length > 0 && (
                  <div className="w-full h-full max-w-lg max-h-[80vh] mx-auto">
                    {/* 영상 */}
                    <div className="w-full h-full overflow-hidden mx-auto my-2">
                      <video
                        src={posts[0].filePath}
                        alt={posts[0].fileTitle}
                        className="w-full h-full"
                        controls // 비디오 컨트롤러 추가
                      />
                    </div>
                  </div>
                )}

                {/* 테이블: 현재 페이지에 해당하는 항목만 렌더링 */}
                {posts.some((post) => post.encodedResourceId !== null) ? ( // 현재 아이템이 있을 때만 테이블 렌더링
                  <table className="w-full table-fixed border-collapse mt-4">
                    <thead className="border-t border-b border-double border-[#FF9C00]">
                      <tr className="font-bold">
                        <th className="w-5/12 p-2">제목</th>
                        <th className="w-3/12 p-2">인코딩 일자</th>
                        <th className="w-3/12 p-2">해상도</th>
                        <th className="w-2/12 p-2"> 포맷</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post, index) =>
                        post.fileTitle !== null ? (
                          <tr key={index}>
                            <td
                              className="text-left p-2 border-b border-gray-300 bg-white overflow-hidden text-ellipsis whitespace-nowrap"
                              title={post.fileTitle}
                              style={{ maxWidth: "150px" }} // 제목 셀의 최대 너비 설정
                            >
                              {post.fileTitle}
                            </td>
                            <td className="p-2 text-gray-800 text-center border-b border-gray-300">
                              {formatDate(post.regTime)}
                            </td>
                            <td className="p-2 text-gray-800 text-center border-b border-gray-300">
                              {post.resolution}
                            </td>
                            <td className="p-2 text-gray-800 text-center border-b border-gray-300">
                              {post.format}
                            </td>
                          </tr>
                        ) : null
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="col-span-full text-center text-gray-500">
                    인코딩된 파일이 없습니다.
                  </div>
                )}

                {/* 페이지네이션 */}
                {posts.some((post) => post.fileTitle !== null) && (
                  <Stack spacing={2} className="mt-10 items-center">
                    <Pagination
                      shape="rounded"
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color={""}
                    />
                  </Stack>
                )}
              </div>
            ) : (
              <div className="col-span-full text-center text-gray-500">
                파일이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default VideoResourceModal; // 컴포넌트를 내보냅니다.
