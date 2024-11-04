import React, { useState, useEffect } from "react";
import {
  ENCODING_RESOURCE_FILE,
  ENCODED_VIDEO,
  RESOLUTION,
} from "../../../constants/api_constant";
import { VIDEO_RESOURCE_BOARD } from "../../../constants/page_constant";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";
import fetcher from "../../../fetcher";
import { decodeJwt } from "../../../decodeJwt";
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const VideoEncoding = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [resolutions, setResolution] = useState([]);
  const [encodingOptions, setEncodingOptions] = useState([
    { format: "mp4", resolution: "" },
  ]);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수
  const accountId = decodeJwt().accountId;

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const fetchImageData = async (originalResourceId) => {
    try {
      const response = await fetcher.get(
        `${ENCODING_RESOURCE_FILE}/${originalResourceId}`
      );
      setVideo(response.data);

      if (
        decodeJwt.roles !== "ROLE_ADMIN" &&
        !response.data.accountList.some(
          (i) => i.accountId === decodeJwt.accountId
        )
      ) {
        alert("접근권한이 없습니다.");
        navigate(VIDEO_RESOURCE_BOARD);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchResolutionData = async () => {
    try {
      const responseResolution = await fetcher.get(RESOLUTION);
      setResolution(responseResolution.data);

      setEncodingOptions((prevOptions) =>
        prevOptions.map((option) => ({
          ...option,
          resolution: `${responseResolution.data[0].width}x${responseResolution.data[0].height}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching resolution:", error);
    }
  };

  useEffect(() => {
    fetchImageData(params.originalResourceId);
    fetchResolutionData();
  }, [params.originalResourceId]);

  const handleAddOption = () => {
    setEncodingOptions([
      ...encodingOptions,
      {
        format: "mp4",
        resolution: `${resolutions[0]?.width}x${resolutions[0]?.height}`,
      },
    ]);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = encodingOptions.filter((_, i) => i !== index);
    setEncodingOptions(updatedOptions);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleEncoding = async () => {
    showAlert("정말 인코딩을 시작하겠습니까?", async () => {
      try {
        let allSuccessful = true;

        for (const option of encodingOptions) {
          const resolutionToUse =
            option.resolution ||
            `${resolutions[0].width}x${resolutions[0].height}`;

          const requestData = {
            accountId: accountId,
            originalResourceId: video.originalResourceId,
            fileTitle: video.fileTitle,
            filePath: video.filePath,
            fileRegTime: video.regTime,
            format: option.format,
            resolution: resolutionToUse,
          };
          const response = await fetcher.post(
            `${ENCODED_VIDEO}/${params.originalResourceId}`,
            requestData
          );
          navigate();
          if (response.status !== 200) {
            allSuccessful = false;
          }

          if (response.status === 202) {
            showAlert("동일한 해상도와 포멧이 존재합니다.", () => {});
            return;
          }
        }
        showAlert("인코딩을 시작했습니다.", () => {
          navigate(-1);
        });

        if (allSuccessful) {
        } else {
          showAlert("일부 인코딩 요청에 실패했습니다.");
        }
      } catch (error) {
        console.error("인코딩 요청 중 오류 발생:", error);
        showAlert("인코딩 중 오류가 발생했습니다.");
      }
    });
  };

  if (!video) {
    return <Loading />;
  }

  return (
    <div className="grid place-items-center min-h-[80vh]">
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          if (alertMessage === "인코딩을 시작했습니다." && confirmAction) {
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
          {!(
            alertMessage === "인코딩을 시작했습니다." ||
            alertMessage === "동일한 해상도와 포멧이 존재합니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>
      <div className="shadow-sm ring-4 ring-gray-900/5 text-center p-6 bg-white rounded-lg max-w-4xl w-full">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4 ">
          {video.fileTitle || "파일 제목"}
        </h1>

        <div className="overflow-hidden flex items-center justify-center bg-white p-10 rounded-lg">
          <div className="w-full h-full flex items-center justify-center">
            <video
              src={video.filePath}
              alt={video.fileTitle}
              className="object-contain w-full h-full"
              controls
            />
          </div>

          <div className="flex flex-col m-10">
            {encodingOptions.map((option, idx) => (
              <div key={idx} className="flex items-center mb-4">
                <select
                  value={option.format}
                  onChange={(e) => {
                    const updatedOptions = [...encodingOptions];
                    updatedOptions[idx].format = e.target.value;
                    setEncodingOptions(updatedOptions);
                  }}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="mp4">MP4</option>
                  <option value="mov">MOV</option>
                  <option value="avi">AVI</option>
                  <option value="mkv">MKV</option>
                </select>

                <select
                  value={option.resolution}
                  onChange={(e) => {
                    const updatedOptions = [...encodingOptions];
                    updatedOptions[idx].resolution = e.target.value;
                    setEncodingOptions(updatedOptions);
                  }}
                  className="ml-4 p-2 border border-gray-300 rounded-md"
                >
                  {resolutions.map((resolution) => (
                    <option
                      value={`${resolution.width}x${resolution.height}`}
                      key={resolution.resolutionId}
                    >
                      {resolution.width} x {resolution.height}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="ml-4 text-blue-500"
                >
                  <AiFillPlusCircle size={25} color="#f25165" />
                </button>

                {encodingOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="ml-2 text-gray-600"
                  >
                    <AiFillMinusCircle size={25} color="#717273" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="items-center text-center row mx-auto mt-4">
          <ButtonComponentB onClick={handleEncoding} color="blue">
            인코딩
          </ButtonComponentB>

          <ButtonComponentB onClick={handleCancel} color="red">
            취소
          </ButtonComponentB>
        </div>
      </div>
    </div>
  );
};

export default VideoEncoding;
