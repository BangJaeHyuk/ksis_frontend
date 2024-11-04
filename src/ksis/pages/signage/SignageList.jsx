import React, { useEffect, useState } from "react";
import fetcher from "../../../fetcher";
import { SIGNAGE_DELETE, SIGNAGE_LIST } from "../../../constants/api_constant";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { SIGNAGE_DTL, SIGNAGE_FORM } from "../../../constants/page_constant";
import { decodeJwt } from "../../../decodeJwt";
import { ToggleSwitch } from "../../css/switch";
import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import ButtonComponentB from "../../components/ButtonComponentB";
import CheckboxTable from "../../components/CheckboxTable";
import SearchBar from "../../components/SearchBar";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const SignageList = () => {
  const userInfo = decodeJwt();

  const [signages, setSignages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [searchCategory, setSearchCategory] = useState("deviceName");
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const postsPerPage = 15;
  const checked = true;

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const loadPage = async () => {
    try {
      const response = await fetcher.get(SIGNAGE_LIST + "/all", {
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

        setLoading(false);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert(error.response?.data || "Unknown error occurred", () => {});
    }
  };

  useEffect(() => {
    loadPage();
  }, [currentPage, searchTerm]);

  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  //signage 삭제
  const deleteSignage = async (e) => {
    try {
      if (selectedPosts.size === 0) {
        showAlert("삭제할 재생장치를 선택해주세요.", () => {});
        return;
      } else {
        showAlert("삭제하시겠습니까?", async () => {
          const queryString = Array.from(selectedPosts).join(",");

          const response = await fetcher.delete(
            SIGNAGE_DELETE + "?signageIds=" + queryString
          );

          console.log(response.data);
          setSignages((prevSignageList) =>
            prevSignageList.filter(
              (signage) => !selectedPosts.has(signage.deviceId)
            )
          );
          setSelectedPosts(new Set());
          showAlert("재생장치가 정상적으로 삭제되었습니다.", () => {});
        });
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
      {/* Alert 컴포넌트 추가 */}
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (
            alertMessage === "삭제할 재생장치를 선택해주세요." &&
            confirmAction
          ) {
            confirmAction();
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
                if (confirmAction) confirmAction();
              }}
            >
              확인
            </Button>
          )}
          {!(
            alertMessage === "삭제할 재생장치를 선택해주세요." ||
            alertMessage === "재생장치가 정상적으로 삭제되었습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
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
      </div>

      <div className="shadow-sm ring-1 ring-gray-900/5 text-center px-8 py-10 bg-white rounded-sm h-170">
        <CheckboxTable
          headers={["재생장치명", "담당자(아이디)", "등록일"]}
          data={signages}
          dataKeys={[
            {
              content: (item) => (
                <Link to={SIGNAGE_DTL + `/${item.deviceId}`}>
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
          <Link to={SIGNAGE_FORM}>
            <ButtonComponentB color="blue">재생장치 등록</ButtonComponentB>
          </Link>
          <ButtonComponentB onClick={deleteSignage} color="red">
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

export default SignageList;
