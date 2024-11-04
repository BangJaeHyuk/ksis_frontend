import React, { useEffect, useState } from "react";
import fetcher from "../../../fetcher";
import { PC_DELETE, PC_LIST } from "../../../constants/api_constant";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { PC_UPDATE_FORM, PC_FORM } from "../../../constants/page_constant";
import { decodeJwt } from "../../../decodeJwt";

import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import ButtonComponentB from "../../components/ButtonComponentB";
import SearchBar from "../../components/SearchBar";
import CheckboxTable from "../../components/CheckboxTable";

const PcList = () => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const postsPerPage = 15;
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = decodeJwt();
  const checked = true;

  const loadPage = async (searchTerm = "", searchCategory = "deviceName") => {
    try {
      const response = await fetcher.get(PC_LIST, {
        params: {
          role: userInfo.roles,
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory,
        },
      });
      if (response.data) {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);

        setLoading(false);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(error.response?.data || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 검색 이벤트 핸들러
  const handleSearch = (searchTerm, searchCategory) => {
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    loadPage(searchTerm, searchCategory);
  };

  useEffect(() => {
    loadPage();
  }, [currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  //pc 삭제
  const deletePc = async () => {
    try {
      if (selectedPosts.size === 0) {
        alert("삭제할 PC를 선택해주세요.");
        return;
      } else {
        if (window.confirm("삭제하시겠습니까?")) {
          const queryString = Array.from(selectedPosts).join(",");

          const response = await fetcher.delete(
            PC_DELETE + "?pcIds=" + queryString
          );

          console.log(response.data);
          setPosts((prevPcList) =>
            prevPcList.filter((pc) => !selectedPosts.has(pc.deviceId))
          );
          setSelectedPosts(new Set()); // 선택된 항목 초기화
          alert("PC가 정상적으로 삭제되었습니다.");
        }
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto whitespace-nowrap py-6 px-10">
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
        일반 PC 관리
      </h1>

      {/* 검색 부분 */}
      <SearchBar
        onSearch={handleSearch} // 검색 이벤트 핸들러 전달
        searchOptions={[
          { value: "deviceName", label: "PC명" },
          ...(userInfo.roles === "ROLE_ADMIN"
            ? [{ value: "account", label: "담당자" }]
            : []),
        ]} // 검색 옵션 전달
        defaultCategory="deviceName" // 기본 카테고리 설정
      />
      {/* 검색 부분 끝 */}

      <div className="shadow-sm ring-1 ring-gray-900/5 text-center px-8 py-10 bg-white rounded-sm h-170">
        <CheckboxTable
          headers={["PC명", "담당자(아이디)", "등록일"]}
          data={posts}
          dataKeys={[
            {
              content: (item) => (
                <Link to={PC_UPDATE_FORM + `/${item.deviceId}`}>
                  {item.deviceName}
                </Link>
              ),
              className:
                "p-2 text-center border-b border-gray-300 text-[#444444] font-semibold hover:underline",
            },
            {
              content: (item) =>
                item.accountList
                  .map((acc) => `${acc.name}(${acc.accountId})`)
                  .join(", "),
              className:
                "p-2 text-gray-800 text-center border-b border-gray-300",
            },
            {
              content: (item) => format(item.regDate, "yyyy-MM-dd"),
              className:
                "p-2 text-gray-800 text-center border-b border-gray-300",
            },
          ]}
          uniqueKey="deviceId"
          selectedItems={selectedPosts}
          setSelectedItems={setSelectedPosts}
          check={checked}
          widthPercentage={12 / 4}
        />
      </div>

      {userInfo.roles === "ROLE_ADMIN" ? (
        <div className="flex justify-end space-x-2 my-10">
          <Link to={PC_FORM}>
            <ButtonComponentB color="blue">일반 PC 등록</ButtonComponentB>
          </Link>
          <ButtonComponentB onClick={deletePc} color="red">
            삭제
          </ButtonComponentB>
        </div>
      ) : null}

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

export default PcList;
