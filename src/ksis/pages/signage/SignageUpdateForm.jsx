import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import fetcher from "../../../fetcher";
import {
  RESOLUTION,
  SIGNAGE_ACCOUNT,
  SIGNAGE_UPDATE,
} from "../../../constants/api_constant";
import {
  SIGNAGE_INVENTORY,
  SIGNAGE_DTL,
} from "../../../constants/page_constant";
import { decodeJwt } from "../../../decodeJwt";
import { Input } from "../../css/input";
import { Button } from "../../css/button";
import { Select } from "../../css/select";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";

const SignageUpdateForm = () => {
  const userInfo = decodeJwt();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const params = useParams();
  const [responsibles, setResponsibles] = useState([{ id: 0, accountId: "" }]);
  const [accounts, setAccounts] = useState([]);
  const [resolutions, setResolution] = useState([]);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  //가로세로크기
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  //불러오기
  const loadPcDtl = async (signageId) => {
    try {
      const response = await fetcher.get(SIGNAGE_UPDATE + `/${signageId}`);
      const { accountList, location, screenSize, resolution, ...rest } =
        response.data;

      setResponsibles(
        accountList.map((account, index) => ({
          id: index,
          accountId: account.accountId,
        }))
      );

      if (
        userInfo.roles !== "ROLE_ADMIN" &&
        !response.data.accountList.some(
          (i) => i.accountId === userInfo.accountId
        )
      ) {
        alert("접근권한이 없습니다.");
        navigate(SIGNAGE_INVENTORY);
      }

      setData(rest);
      setAddress(location);
      setSelectedValue(resolution);

      const screen = screenSize.split(" x ");
      setWidth(screen[0]);
      setHeight(screen[1]);
    } catch (error) {
      console.log(error.response);
    }

    loadMsd();
  };

  const loadMsd = async () => {
    try {
      const [responseAccount, responseResolution] = await Promise.all([
        fetcher.get(SIGNAGE_ACCOUNT),
        fetcher.get(RESOLUTION),
      ]);
      if (responseAccount.data && responseResolution.data) {
        setAccounts(responseAccount.data);
        setResolution(responseResolution.data);

        setLoading(false);
      } else {
        console.error("No data property in response");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(error.response?.data || "Unknown error occurred");
    }
  };

  useEffect(() => {
    loadPcDtl(params.id);
  }, [params.id]);

  //해상도
  const [selectedValue, setSelectedValue] = useState();
  const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  //주소불러오기
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const execDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = ""; // 주소 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        //주소 정보를 해당 필드에 넣는다.
        setAddress(addr);
        document.getElementById("detailAddress").focus();
        setTimeout(() => {
          const detailAddressInput = document.getElementById("detailAddress");
          if (detailAddressInput) {
            detailAddressInput.focus();
          }
        }, 0);
      },
      left: window.screen.width / 2 - 500 / 2,
      top: window.screen.height / 2 - 600 / 2,
    }).open();
  };

  // 이전 페이지로 이동
  const onCancel = () => {
    navigate(-1);
  };

  //patch
  useEffect(() => {
    setData((prevData) => ({
      ...prevData,
      location: address,
      resolution: selectedValue,
      screenSize: width + " x " + height,
    }));
  }, [address, selectedValue, width, height]);

  const onChangeHandler = (e) => {
    const { value, name } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const ipRegex =
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

      if (data.ipAddress === "" || !ipRegex.test(data.ipAddress)) {
        setError("유효한 IP주소를 입력하세요.");
        console.log(data.ipAddress);
        document.getElementById("ipAddress").focus();
        console.log("error", error);
        return false;
      }

      const formData = new FormData();
      formData.append(
        "signageFormDto",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );

      const accountIds = responsibles.map((responsible) => {
        const selectElement = document.getElementById(
          `responsible-${responsible.id}`
        );
        return selectElement ? selectElement.value : "";
      });

      formData.append(
        "accountList",
        new Blob([JSON.stringify(accountIds)], { type: "application/json" })
      );

      const response = await fetcher.patch(SIGNAGE_UPDATE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);

      if (response.status === 200) {
        showAlert("재생장치가 정상적으로 수정되었습니다.", () => {
          navigate(SIGNAGE_DTL + `/${data.deviceId}`);
        });
      } else {
        showAlert("재생장치 수정을 실패했습니다.");
        return;
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  //담당자 +, - 버튼
  const addResponsible = () => {
    setResponsibles((prev) => [
      ...prev,
      { id: prev.length ? prev[prev.length - 1].id + 1 : 0, accountId: "" },
    ]);
  };

  const removeResponsible = (id) => {
    setResponsibles((prev) =>
      prev.filter((responsible) => responsible.id !== id)
    );
  };

  const handleResponsibleChange = (e, index) => {
    const { value } = e.target;

    const isDuplicate = responsibles.some(
      (responsible, idx) => responsible.accountId === value && idx !== index
    );

    if (!isDuplicate) {
      const newResponsibles = [...responsibles];
      newResponsibles[index].accountId = value;

      setResponsibles(newResponsibles);
    } else {
      alert("이미 존재하는 담당자입니다.");
      e.target.value = "";
      return;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid place-items-center min-h-[80vh]">
      {/* Alert 컴포넌트 추가 */}
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (
            alertMessage === "재생장치가 정상적으로 수정되었습니다." &&
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
          {alertMessage !== "재생장치가 정상적으로 수정되었습니다." && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <div className="shadow-sm ring-4 ring-gray-900/5 text-center p-6 bg-white rounded-lg w-1/2 min-w-96">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
          재생장치 수정
        </h1>
        <br />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showAlert("재생장치를 수정하시겠습니까?", handleSave);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                재생장치 이름
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  required
                  minLength="2"
                  maxLength="10"
                  value={data.deviceName}
                  onChange={onChangeHandler}
                  name="deviceName"
                  type="text"
                />
              </div>
            </div>

            {responsibles.map((responsible, index) => (
              <div className="flex items-center mt-8" key={responsible.id}>
                <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                  담당자
                </label>
                <div className="flex-grow flex items-center space-x-2">
                  <Select
                    required
                    value={responsible.accountId}
                    id={`responsible-${responsible.id}`}
                    onChange={(e) => handleResponsibleChange(e, index)}
                  >
                    <option value="">담당자 선택</option>
                    {accounts.map((account) => (
                      <option value={account.accountId} key={account.accountId}>
                        {account.name}({account.accountId})
                      </option>
                    ))}
                  </Select>

                  <div className="ml-2 flex items-center">
                    <button type="button" onClick={addResponsible}>
                      <AiFillPlusCircle size={25} color="#f25165" />
                    </button>
                    {responsibles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResponsible(responsible.id)}
                        className="ml-2"
                      >
                        <AiFillMinusCircle size={25} color="#717273" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <div className="flex items-center mt-8">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                위치
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  id="address"
                  type="text"
                  value={address}
                  readOnly
                  className="mr-3"
                />
                <ButtonComponentB
                    onClick={execDaumPostcode}
                    color="gray"
                >
                  주소검색
                </ButtonComponentB>
              </div>
            </div>

            <div className="flex items-center mt-8">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                상세주소
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  required
                  id="detailAddress"
                  value={data.detailAddress}
                  onChange={onChangeHandler}
                  name="detailAddress"
                  placeholder="상세주소 입력"
                  minLength="2"
                  maxLength="50"
                />
              </div>
            </div>

            <div className="flex items-center mt-8">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                IP주소
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  required
                  id="ipAddress"
                  value={data.ipAddress}
                  onChange={onChangeHandler}
                  name="ipAddress"
                  type="text"
                  placeholder="IP 주소 입력"
                />
                {error && <p className="text-red-500 text-sm ml-2">{error}</p>}
              </div>
            </div>

            <div className="flex items-center mt-8">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                해상도
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Select required onChange={handleChange} value={selectedValue}>
                  <option value="">해상도 선택</option>
                  {resolutions.map((resolution) => (
                    <option
                      value={`${resolution.name} (${resolution.width} x ${resolution.height})`}
                      key={resolution.resolutionId}
                    >
                      {resolution.name} ({resolution.width} x{" "}
                      {resolution.height})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center mt-8">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                너비(W)
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  required
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  type="number"
                  placeholder="너비 입력 (cm 기준)"
                />
              </div>
            </div>

            <div className="flex items-center mt-8">
              <label className="w-40 block text-sm font-semibold leading-6 text-gray-900">
                높이(H)
              </label>
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  type="number"
                  placeholder="높이 입력 (cm 기준)"
                />
              </div>
            </div>
          </div>
          <br />

          <div className="mt-6 flex justify-center gap-4">
            <ButtonComponentB type="submit" color="blue">
              수정하기
            </ButtonComponentB>
            <ButtonComponentB
                onClick={onCancel}
                color="red"
            >
              뒤로가기
            </ButtonComponentB>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignageUpdateForm;
