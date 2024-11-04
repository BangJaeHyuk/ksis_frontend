import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogActions,
} from "../../css/dialog";
import fetcher from "../../../fetcher";
import { RESOLUTION } from "../../../constants/api_constant";
import { ImCross } from "react-icons/im";
import { Input } from "../../css/input";
import { Button } from "../../css/button";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import ButtonComponentB from "../../components/ButtonComponentB";

const ResolutionAddModal = ({ isOpen, onRequestClose }) => {
  const [data, setData] = useState({
    name: "",
    width: "",
    height: "",
  });

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const onChangeHandler = (e) => {
    const { value, name } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const postResolution = async () => {
    try {
      if (data.width % 2 !== 0 || data.height % 2 !== 0) {
        showAlert("해상도는 짝수만 등록가능합니다.");
        return;
      }

      const response = await fetcher.post(RESOLUTION, data);

      if (response.status === 200) {
        showAlert("해상도가 등록되었습니다.", () => {
          setData({ name: "", width: "", height: "" });
          onRequestClose();
        });
      } else if (response.status === 202) {
        showAlert("이미 등록된 해상도입니다.");
        return;
      } else {
        showAlert("해상도 등록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const onCloseHandler = async () => {
    setData({ name: "", width: "", height: "" });
    onRequestClose();
  };

  return (
    <Dialog open={isOpen} onClose={onRequestClose}>
      {/* Alert 컴포넌트 추가 */}
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (alertMessage === "해상도가 등록되었습니다." && confirmAction) {
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
          {alertMessage !== "해상도가 등록되었습니다." && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <div className="grid place-items-center min-h-[55vh] relative">
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all my-8 w-3/12 p-6 min-w-96">
          <DialogTitle>
            <h1 className="text-xl font-bold text-gray-900 ml-1">
              해상도 등록
            </h1>
            <ImCross
              className="absolute top-5 right-5 text-red-500 cursor-pointer"
              onClick={onCloseHandler}
            />
          </DialogTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showAlert("해상도를 등록하시겠습니까?", postResolution);
            }}
          >
            <DialogBody className="mt-2">
              <div className="mb-4 flex items-center">
                <label className="w-40 ml-px block pl-4 text-sm font-semibold leading-6 text-gray-900">
                  이름
                </label>
                <div className="flex-grow flex items-center space-x-2">
                  <Input
                    required
                    value={data.name}
                    onChange={onChangeHandler}
                    name="name"
                    type="text"
                  />
                </div>
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-40 ml-px block pl-4 text-sm font-semibold leading-6 text-gray-900">
                  가로(px)
                </label>
                <div className="flex-grow flex items-center space-x-2">
                  <Input
                    required
                    value={data.width}
                    onChange={onChangeHandler}
                    name="width"
                    type="number"
                  />
                </div>
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-40 ml-px block pl-4 text-sm font-semibold leading-6 text-gray-900">
                  세로(px)
                </label>
                <div className="flex-grow flex items-center space-x-2">
                  <Input
                    required
                    value={data.height}
                    onChange={onChangeHandler}
                    name="height"
                    type="number"
                  />
                </div>
              </div>
            </DialogBody>
            <DialogActions>
              <ButtonComponentB type="submit" color="blue">
                등록
              </ButtonComponentB>
            </DialogActions>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default ResolutionAddModal;
