import React, { useEffect, useState } from "react";
import fetcher from "../../../fetcher";
import {
  ACCOUNT_FORM,
  ACCOUNT_LIST,
} from "../../../constants/account_constant";
import { Link, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../decodeJwt";
import { MAIN } from "../../../constants/page_constant";

import Loading from "../../components/Loading";
import PaginationComponent from "../../components/PaginationComponent";
import ButtonComponent from "../../components/ButtonComponent";
import SearchBar from "../../components/SearchBar";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";
import CheckboxTable from "../../components/CheckboxTable";
import ButtonComponentB from "../../components/ButtonComponentB";

const AccountList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userInfo = decodeJwt();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("accountId");
  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  const postsPerPage = 15;
  const checked = false;

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const loadPage = async (page) => {
    try {
      const response = await fetcher.get(ACCOUNT_LIST, {
        params: {
          page: page - 1,
          size: postsPerPage,
          searchTerm,
          searchCategory,
        },
      });

      if (response.data) {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
    } finally {
      setLoading(false); // 데이터 로딩 후 로딩 상태 해제
    }
  };

  useEffect(() => {
    // 관리자가 아닌 경우 접근 차단
    if (!userInfo.roles.includes("ROLE_ADMIN")) {
      showAlert("관리자만 접근 가능합니다.");
      navigate(MAIN);
    } else {
      loadPage(currentPage);
    }
  }, [navigate, userInfo.roles]);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, searchTerm]);

  const handleToggleActive = async (accountId, isActive) => {
    const action = isActive ? "활성화" : "비활성화";
    showAlert(`계정을 ${action}하시겠습니까?`, async () => {
      try {
        const response = await fetcher.put(
          `${ACCOUNT_FORM}/${accountId}/active`,
          JSON.stringify({
            isActive: isActive,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          // 로컬 상태 업데이트
          showAlert("비활성화 여부가 변경되었습니다.", () => {});
          await loadPage(currentPage);
        } else {
          console.error(
            "Failed to update account status:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term, category) => {
    setSearchTerm(term);
    setSearchCategory(category);
    setCurrentPage(1);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl whitespace-nowrap p-6">
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (
            alertMessage === "비활성화 여부가 변경되었습니다." &&
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
          {alertMessage !== "비활성화 여부가 변경되었습니다." && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        계정목록
      </h1>

      <SearchBar
        onSearch={handleSearch}
        searchOptions={[
          { value: "accountId", label: "계정 아이디" },
          { value: "name", label: "이름" },
          { value: "businessTel", label: "업무 연락처" },
          { value: "isActive", label: "비활성화 여부" },
        ]}
        defaultCategory="accountId"
        selectOptions={{
          isActive: [
            { value: "", label: "전체" },
            { value: "true", label: "비활성화" },
            { value: "false", label: "활성화" },
          ],
        }}
      />

      <div className="shadow-sm ring-1 ring-gray-900/5 text-center px-8 py-10 bg-white rounded-sm h-170">
        <CheckboxTable
          headers={[
            "계정 아이디",
            "이름",
            "업무 전화번호",
            "비활성화 여부",
            "수정/비활성화",
          ]}
          data={posts}
          dataKeys={[
            {
              content: (item) => item.accountId,
              className: "text-gray-800 text-center border-b border-gray-300",
            },
            {
              content: (item) => item.name,
              className: "text-gray-800 text-center border-b border-gray-300",
            },
            {
              content: (item) => item.businessTel,
              className: "text-gray-800 text-center border-b border-gray-300",
            },
            {
              content: (item) => (item.isActive ? "O" : "X"),
              className: "text-gray-800 text-center border-b border-gray-300",
            },
          ]}
          uniqueKey="accountId"
          check={checked}
          widthPercentage={12 / 5}
          renderActions={(item) => (
            <>
              <ButtonComponent
                to={ACCOUNT_FORM + `/${item.accountId}`}
                // defaultColor="blue-600"
                // shadowColor="blue-800"
                color="blue"
              >
                수정
              </ButtonComponent>

              <ButtonComponent
                onClick={() =>
                  handleToggleActive(item.accountId, item.isActive)
                }
                // defaultColor={item.isActive ? "green-600" : "red-600"}
                // shadowColor={item.isActive ? "green-800" : "red-800"}
                color="red"
              >
                {item.isActive ? "활성화" : "비활성화"}
              </ButtonComponent>
            </>
          )}
        />
      </div>

      <div className="flex justify-end space-x-2 my-10">
        <ButtonComponentB to={ACCOUNT_FORM} color="orange">
          계정 등록
        </ButtonComponentB>
      </div>

      {/* 페이지네이션 */}
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

export default AccountList;
