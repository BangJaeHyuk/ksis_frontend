import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BOARD, MAIN } from "../../../constants/page_constant"; // MAIN 상수 추가
import { API_NOTICE, API_BASIC } from "../../../constants/api_constant";
import fetcher from "../../../fetcher"; // fetcher 가져오기
import { decodeJwt } from "../../../decodeJwt";
import { Input } from "../../css/input";
import { Button } from "../../css/button";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";

const ApiForm = () => {
  const [apiName, setApiName] = useState("");
  const [provider, setProvider] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { apiId } = useParams(); // apiId를 URL에서 가져오기

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  useEffect(() => {
    const userInfo = decodeJwt();

    if (!userInfo.roles.includes("ROLE_ADMIN")) {
      alert("관리자 계정만 접근 가능합니다.");
      navigate(MAIN); // MAIN으로 이동
      return;
    }

    if (apiId) {
      const fetchApiData = async () => {
        try {
          const response = await fetcher.get(API_NOTICE + `/${apiId}`); // fetcher로 데이터 가져오기
          const data = response.data;
          setApiName(data.apiName); // 데이터 구조에 맞게 수정
          setProvider(data.provider || ""); // 제공업체가 없을 경우 기본값 설정
          setKeyValue(data.keyValue || ""); // API Key가 없을 경우 기본값 설정
          setExpiryDate(
            data.expiryDate ? data.expiryDate.substring(0, 10) : ""
          ); // 날짜 형식 조정
          setPurpose(data.purpose || ""); // 사용 목적이 없을 경우 기본값 설정
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchApiData();
    } else {
      setLoading(false); // 새로운 API 등록의 경우 로딩 완료
    }
  }, [apiId, navigate]);

  const validateDate = (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  };

  const handleSubmit = async () => {
    if (!validateDate(expiryDate)) {
      showAlert(
        "날짜 형식이 올바르지 않습니다. yyyy-mm-dd 형식으로 입력해주세요."
      );
      return;
    }

    const apiData = {
      apiName,
      provider,
      keyValue,
      expiryDate: new Date(expiryDate).toISOString(), // ISO 8601 형식으로 변환
      purpose,
    };

    try {
      const response = apiId
        ? await fetcher.put(API_BASIC + `/update/${apiId}`, apiData) // PUT 요청 시 수정
        : await fetcher.post(API_BASIC + "/register", apiData); // POST 요청 시 등록

      if (response.status === 200 || response.status === 201) {
        showAlert("API 정보가 성공적으로 저장되었습니다.", () => {
          navigate(API_BOARD); // 성공 시 ApiBoard로 이동
        });
      } else {
        showAlert("저장 실패");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("정보 저장 중 오류 발생");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>오류 발생: {error}</p>;
  }

  return (
    <div className="grid place-items-center min-h-[80vh]">
      {/* Alert 컴포넌트 추가 */}
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (
            alertMessage === "API 정보가 성공적으로 저장되었습니다." &&
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
          {alertMessage !== "API 정보가 성공적으로 저장되었습니다." && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <div className="shadow-sm ring-4 ring-gray-900/5 text-center p-6 bg-white rounded-lg w-1/2 min-w-96">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
          {apiId ? "API 수정" : "API 등록"}
        </h1>
        <br />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showAlert(
              apiId
                ? "API 정보를 수정하시겠습니까?"
                : "API 정보를 등록하시겠습니까?",
              handleSubmit
            );
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-10">
            <div className="flex items-center">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                API 이름
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  type="text"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                제공업체
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                API Key
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  type="text"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                만료일
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  type="date"
                  max="9999-12-31"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                사용 목적
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <ButtonComponentB type="submit" color="blue">
                {apiId ? "수정하기" : "등록하기"}
              </ButtonComponentB>

              <ButtonComponentB
                type="button"
                onClick={() => navigate(-1)}
                color="red"
              >
                뒤로가기
              </ButtonComponentB>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiForm;
