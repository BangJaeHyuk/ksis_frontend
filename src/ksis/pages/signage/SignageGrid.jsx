import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import fetcher from "../../../fetcher";
import { SIGNAGE_LIST } from "../../../constants/api_constant";
import { Link } from "react-router-dom";
import { SIGNAGE_DTL, SIGNAGE_FORM } from "../../../constants/page_constant";
import { decodeJwt } from "../../../decodeJwt";
import { ToggleSwitch } from "../../css/switch";

import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import ButtonComponentB from "../../components/ButtonComponentB";
import SearchBar from "../../components/SearchBar";

const SignageGrid = () => {
  const userInfo = decodeJwt();
  const [signages, setSignages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchCategory, setSearchCategory] = useState("deviceName");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const postsPerPage = 8; // 한 페이지 8개 데이터

  const loadPage = async () => {
    try {
      const response = await fetcher.get(SIGNAGE_LIST + `/grid`, {
        params: {
          role: userInfo.roles,
          page: currentPage - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory,
        },
      });
      console.log(response);
      if (response.data) {
        setSignages(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  // 검색어 변경 핸들러
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-6">
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        재생장치 관리
      </h1>

      <SearchBar
        onSearch={(term, category) => {
          setSearchTerm(term);
          setSearchCategory(category);
          setCurrentPage(1);
        }}
        searchOptions={[
          { value: "deviceName", label: "재생장치명" },
          ...(userInfo.roles === "ROLE_ADMIN"
            ? [{ value: "account", label: "담당자" }]
            : []),
        ]}
        defaultCategory="deviceName"
      />

      <div className="flex justify-between my-4">
        <div className="inline-flex items-center">
          <ToggleSwitch />
        </div>
        {userInfo.roles === "ROLE_ADMIN" ? (
          <div className=" inline-flex items-center">
            <div className="flex justify-end space-x-2">
              <Link to={SIGNAGE_FORM}>
                <ButtonComponentB color="blue">재생장치 등록</ButtonComponentB>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
        {signages.map((signage) => (
          <div
            key={signage.deviceId}
            className="group relative border border-[#FF9C00] p-3"
          >
            <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
              <img
                alt={signage.deviceName}
                src={signage.thumbNail}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="mt-2 text-gray-700 text-center w-full border border-[#FF9C00] rounded-md p-1">
              재생장치 : {signage.deviceName}
            </div>
            <Link to={SIGNAGE_DTL + `/${signage.deviceId}`}>
              <button
                type="button"
                className="mt-2 w-full p-1 rounded-md border border-[#FF9C00] bg-white text-[#FF9C00] text-sm font-semibold
                shadow-sm hover:bg-[#FF9C00] hover:text-white hover:shadow-inner hover:shadow-[#FF9C00] focus-visible:outline-[#FF9C00] transition duration-200"
              >
                상세보기
              </button>
            </Link>
          </div>
        ))}
      </div>

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

export default SignageGrid;
