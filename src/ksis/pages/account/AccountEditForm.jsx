import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetcher from "../../../fetcher";
import {
  ACCOUNT_FORM,
  ACCOUNT_LIST_BOARD,
} from "../../../constants/account_constant";
import { decodeJwt } from "../../../decodeJwt";
import { MAIN } from "../../../constants/page_constant";
import { Input } from "../../css/input";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button"; // Button 컴포넌트 추가
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";

const AccountEditForm = () => {
  const { accountId } = useParams();
  const [formData, setFormData] = useState({
    accountId: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthDate: "",
    businessTel: "",
    emergencyTel: "",
    email: "",
    position: "",
    gender: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userInfo = decodeJwt();

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  useEffect(() => {
    // 사용자 권한 확인
    if (
      userInfo.accountId !== accountId &&
      !userInfo.roles.includes("ROLE_ADMIN")
    ) {
      alert("본인 계정이거나 관리자만 접근 가능합니다.");
      navigate(MAIN);
      return;
    } else {
      setHasPermission(true); // 권한이 있는 경우
    }

    // 계정 데이터를 가져와서 폼에 설정합니다.
    const fetchAccountData = async () => {
      try {
        const response = await fetcher.get(`${ACCOUNT_FORM}/${accountId}`);
        if (response.data) {
          setFormData({
            ...response.data,
            password: "",
            confirmPassword: "",
          });

          setLoading(false);
        } else {
          console.error("계정 데이터를 가져오지 못했습니다.");
        }
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      }
    };

    fetchAccountData();
  }, [accountId]);

  useEffect(() => {
    // 비밀번호와 비밀번호 확인이 일치하는지 확인
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 전화번호 필드인 경우 handlePhoneNumberChange 호출
    if (name === "businessTel" || name === "emergencyTel") {
      handlePhoneNumberChange(e, name);
    } else {
      // 일반적인 필드에 대한 처리
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePhoneNumberChange = (e, fieldName) => {
    let value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11); // 숫자만 남기고 11자리 제한

    const parts = [value.slice(0, 3), value.slice(3, 7), value.slice(7)].filter(
      Boolean
    ); // 빈 문자열 제외

    const formattedValue = parts.join("-"); // 하이픈 추가
    setFormData({ ...formData, [fieldName]: formattedValue });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 비밀번호와 비밀번호 확인 일치 확인
    if (name === "password" || name === "confirmPassword") {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordMatch) {
      showAlert("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }

    const cleanedFormData = {
      ...formData,
      gender: formData.gender.trim() === "" ? "UNKNOWN" : formData.gender,
    };

    try {
      const response = await fetcher.put(
        `${ACCOUNT_FORM}/${accountId}`,
        cleanedFormData
      );
      if (response.status === 200) {
        showAlert("계정 정보가 성공적으로 업데이트되었습니다.", () =>
          navigate(
            userInfo.roles.includes("ROLE_ADMIN") ? ACCOUNT_LIST_BOARD : MAIN
          )
        );
      } else {
        console.error("계정 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("계정 업데이트 중 오류 발생:", error);
    }
  };

  if (!hasPermission) {
    return null; // 권한이 없으면 아무것도 보여주지 않음
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid place-items-center min-h-[80vh]">
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (
            alertMessage === "계정 정보가 성공적으로 업데이트되었습니다." &&
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
          {alertMessage !== "계정 정보가 성공적으로 업데이트되었습니다." && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <div className="shadow-sm ring-4 ring-gray-900/5 text-center p-6 bg-white rounded-lg w-1/2 min-w-96">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
          계정 수정
        </h1>
        <br />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showAlert("정말로 수정하시겠습니까?", () => handleSubmit(e));
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <div className="flex items-center space-x-10">
              <label
                htmlFor="accountId"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                아이디<span className="text-red-500">*</span>
              </label>
              <Input
                id="accountId"
                name="accountId"
                type="text"
                value={formData.accountId}
                readOnly
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="name"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                이름<span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                maxLength={20}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="password"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                비밀번호<span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                maxLength={20}
                value={formData.password}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="confirmPassword"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                비밀번호 확인<span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                maxLength={20}
                value={formData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          {formData.confirmPassword && (
            <div
              className={`mt-2 font-bold ${
                passwordMatch ? "text-green-600" : "text-red-600"
              }`}
            >
              {passwordMatch
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."}
            </div>
          )}

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <div className="flex items-center space-x-10">
              <label
                htmlFor="businessTel"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                업무 전화번호<span className="text-red-500">*</span>
              </label>
              <Input
                id="businessTel"
                name="businessTel"
                type="tel"
                value={formData.businessTel}
                onChange={handleChange}
                required
                pattern="\d{3}-\d{4}-\d{4}"
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="email"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                이메일<span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                maxLength={50}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="birthDate"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                생년월일
              </label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="emergencyTel"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                긴급 연락처
              </label>
              <Input
                id="emergencyTel"
                name="emergencyTel"
                type="tel"
                value={formData.emergencyTel}
                onChange={handleChange}
                pattern="\d{3}-\d{4}-\d{4}"
              />
            </div>

            <div className="flex items-center space-x-10">
              <label
                htmlFor="position"
                className="w-44 pl-4 text-left text-sm font-semibold text-gray-900"
              >
                직위
              </label>
              <Input
                id="position"
                name="position"
                type="text"
                maxLength={20}
                value={formData.position}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <label className="w-44 pl-4 text-left text-sm font-semibold text-gray-900">
                성별
              </label>
              <div className="flex gap-4 ml-10">
                <div>
                  <input
                    type="radio"
                    id="gender-male"
                    name="gender"
                    value="MALE"
                    checked={formData.gender === "MALE"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="gender-male">남성</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="gender-female"
                    name="gender"
                    value="FEMALE"
                    checked={formData.gender === "FEMALE"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="gender-female">여성</label>
                </div>
              </div>
            </div>
          </div>

          <br />

          <div className="mt-10 flex gap-4 justify-center">
            <ButtonComponentB type="submit" color="blue">
              저장
            </ButtonComponentB>

            <ButtonComponentB
              to={
                userInfo.roles.includes("ROLE_ADMIN")
                  ? ACCOUNT_LIST_BOARD
                  : MAIN
              }
              color="red"
            >
              취소
            </ButtonComponentB>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEditForm;
