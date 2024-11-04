import React from "react";
import "./download_app.css"; // css 파일 임포트

function download_app() {
  const handleDownload = () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // 다운로드 링크를 설정
    const url = API_BASE_URL + "/download";
    const link = document.createElement("a");
    link.href = url;
    link.download = "ElectronReact Setup 4.6.0.exe";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ksis 앱 실행 이벤트
  const handleOpenApp = () => {
    // 특정 URL 프로토콜 호출
    const url = "ksis://open";
    window.location.href = url;
  };

  return (
    <div className="app-download-page">
      <div className="content-container">
        <div className="text-section">
          <h1>사이트 이용을 원하시면 앱을 설치해주세요.</h1>
          <p>이미 다운로드하셨다면 앱을 실행해 주세요.</p>
          <button onClick={handleDownload} className="download-button">
            Windows용 다운로드
          </button>
          <button onClick={handleOpenApp} className="open-app-button">
            설치된 앱 열기
          </button>
        </div>
        <div className="image-section">
          <img
            src="/file/img/app.png"
            alt="앱 미리보기"
            className="app-preview"
          />
        </div>
      </div>
    </div>
  );
}

export default download_app;
