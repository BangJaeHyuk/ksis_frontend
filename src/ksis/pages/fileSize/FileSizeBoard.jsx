import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router의 useNavigate 가져오기
import { FILE_SIZE } from "../../../constants/api_constant";
import { MAIN } from "../../../constants/page_constant";
import fetcher from "../../../fetcher";
import { decodeJwt } from "../../../decodeJwt";
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";

const FileSizeBoard = () => {
  const [imageMaxSize, setImageMaxSize] = useState(10); // 기본값 설정
  const [videoMaxSize, setVideoMaxSize] = useState(500); // 기본값 설정
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const navigate = useNavigate(); // navigate 함수 정의

  // 파일 크기 설정을 API에서 가져오는 함수
  const fetchFileSize = async () => {
    try {
      const response = await fetcher.get(FILE_SIZE); // GET 요청을 통해 데이터 조회
      if (response.status === 200) {
        const { imageMaxSize, videoMaxSize } = response.data;
        setImageMaxSize(imageMaxSize); // 이미지 최대 크기 설정
        setVideoMaxSize(videoMaxSize); // 비디오 최대 크기 설정
      } else {
        alert("파일 크기 설정값을 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching file sizes:", error);
      alert("파일 크기 설정을 가져오는 중 오류 발생");
    } finally {
      setLoading(false); // 데이터 로딩 상태 해제
    }
  };

  // 컴포넌트가 마운트될 때 유저 권한을 체크하고 파일 크기 설정을 불러옴
  useEffect(() => {
    const userInfo = decodeJwt();

    // 관리자 권한 체크
    if (!userInfo.roles.includes("ROLE_ADMIN")) {
      alert("관리자 계정만 접근 가능합니다.");

      navigate(MAIN); // MAIN으로 이동
      return;
    }

    // 파일 크기 설정값 불러오기
    fetchFileSize();
  }, [navigate]); // navigate 의존성 추가

  const handleSave = async () => {
    const fileSizeData = { imageMaxSize, videoMaxSize, fileSizeId: 1 };

    // 사용자 확인 창 추가
    const confirmMessage = "설정을 저장하시겠습니까?";
    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return; // 사용자가 취소한 경우 함수 종료
    }

    try {
      const response = await fetcher.put(FILE_SIZE, fileSizeData); // fetcher를 사용한 PUT 요청

      if (response.status === 200 || response.status === 201) {
        alert("설정이 저장되었습니다.");
      } else {
        alert("설정 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating file sizes:", error);
      alert("설정 저장 중 오류 발생");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl whitespace-nowrap p-6">
      <header className="mb-6">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
          최대 용량 설정
        </h1>
      </header>
      <table className="w-full border-collapse bg-white shadow-lg">
        <tbody>
          <tr>
            <th className="border-t border-b border-gray-300 p-2 text-gray-800 mx-auto bg-gray-100">
              이미지 제한 크기
            </th>
            <td className="border-t border-b border-gray-300 p-2">
              <div className="flex items-center">
                <input
                  type="number"
                  className="border border-gray-300 p-1 rounded-md w-20 text-right"
                  value={imageMaxSize}
                  onChange={(e) => setImageMaxSize(e.target.value)}
                  min="0"
                />
                <span className="ml-2 text-gray-800">MB</span>
              </div>
              <p className="text-gray-600">
                하나의 이미지에 대해 최대 용량을 지정할 수 있습니다.
              </p>
            </td>
          </tr>
          <tr>
            <th className="border-b border-gray-300 p-2 text-gray-800 mx-auto bg-gray-100">
              영상 제한 크기
            </th>
            <td className="border-b border-gray-300 p-2 bg-gray-50">
              <div className="flex items-center">
                <input
                  type="number"
                  className="border border-gray-300 p-1 rounded-md w-20 text-right"
                  value={videoMaxSize}
                  onChange={(e) => setVideoMaxSize(e.target.value)}
                  min="0"
                />
                <span className="ml-2 text-gray-800">MB</span>
              </div>
              <p className="text-gray-600">
                하나의 영상에 대해 최대 용량을 지정할 수 있습니다.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-end mt-6">
        <ButtonComponentB onClick={handleSave} color="blue">
          저장
        </ButtonComponentB>
      </div>
    </div>
  );
};

export default FileSizeBoard;
