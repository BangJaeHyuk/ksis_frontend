import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./ksis/components/SideBar";
import "./index.css";
import ProtectedRoute from "./ksis/components/ProtectedRoute";
import {
  API_BOARD,
  API_FORM,
  FILESIZE_FORM,
  NOTICE_BOARD,
  NOTICE_FORM,
  NOTICE_DTL,
  IMAGE_RESOURCE_BOARD,
  IMAGE_FILE_BOARD,
  VIDEO_RESOURCE_BOARD,
  VIDEO_FILE_BOARD,
  VIDEO_RESOURCE_MODAL,
  VIDEO_ENCODING,
  IMAGE_RESOURCE_MODAL,
  IMAGE_ENCODING,
  ACCESSLOG_INVENTORY,
  ACTIVITYLOG_INVENTORY,
  UPLOADLOG_INVENTORY,
  ERROR_403,
  MAIN,
  RESOLUTION_LIST,
  SIGNAGE_PLAY_PAGE,
  TRASH_IMAGE_FILE,
  TRASH_VIDEO_FILE,
  TRASH_NOTICE,
  DEACTIVE_NOTICE_DTL,
} from "./constants/page_constant";
import {
  PC_DTL,
  PC_FORM,
  PC_INVENTORY,
  PC_UPDATE_FORM,
  SIGNAGE_DTL,
  SIGNAGE_FORM,
  SIGNAGE_GRID,
  SIGNAGE_INVENTORY,
  SIGNAGE_UPDATE_FORM,
} from "./constants/page_constant";
import {
  ACCOUNT_EDIT_FORM,
  ACCOUNT_FORM,
  ACCOUNT_LIST_BOARD,
  TOKEN_CALLBACK,
  TOKEN_CHECK,
} from "./constants/account_constant";
import PcForm from "./ksis/pages/pc/PcForm";
import PcList from "./ksis/pages/pc/PcList";
import PcDtl from "./ksis/pages/pc/PcDtl";
import PcUpdateForm from "./ksis/pages/pc/PcUpdateForm";
import SignageList from "./ksis/pages/signage/SignageList";
import SignageForm from "./ksis/pages/signage/SignageForm";
import SignageGrid from "./ksis/pages/signage/SignageGrid";
import SignageDtl from "./ksis/pages/signage/SignageDtl";
import SignageUpdateForm from "./ksis/pages/signage/SignageUpdateForm";
import ApiBoard from "./ksis/pages/api/ApiBoard";
import ApiForm from "./ksis/pages/api/ApiForm";
import FileSizeBoard from "./ksis/pages/fileSize/FileSizeBoard";
import NoticeBoard from "./ksis/pages/notice/NoticeBoard";
import NoticeForm from "./ksis/pages/notice/NoticeForm";
import NoticeDtl from "./ksis/pages/notice/NoticeDtl.jsx";
import TrashNoticeDtl from "./ksis/pages/trash/TrashNoticeDtl.jsx";
import AccountRegForm from "./ksis/pages/account/AccountRegForm";
import AccountList from "./ksis/pages/account/AccountList";
import AccountEditForm from "./ksis/pages/account/AccountEditForm";
import TokenCallback from "./ksis/pages/account/TokenCallback";
import ImageResourceBoard from "./ksis/pages/fileMng/ImageResourceBoard.jsx";
import ImageFileBoard from "./ksis/pages/fileMng/ImageFileBoard.jsx";
import VideoResourceBoard from "./ksis/pages/fileMng/VideoResourceBoard.jsx";
import VideoFileBoard from "./ksis/pages/fileMng/VideoFileBoard.jsx";
import DownloadApp from "./ksis/pages/download-app/download_app.jsx";
import ImageResourceModal from "./ksis/pages/fileMng/ImageResourceModal.jsx";
import ImageEncoding from "./ksis/pages/fileMng/ImageEncoding.jsx";
import VideoResourceModal from "./ksis/pages/fileMng/VideoResourceModal.jsx";
import VideoEncoding from "./ksis/pages/fileMng/VideoEncoding.jsx";
import Main from "./ksis/pages/main/Main.jsx";
import AccessLogBoard from "./ksis/pages/log/AccessLogBoard.jsx";
import UploadLogBoard from "./ksis/pages/log/UploadLogBoard.jsx";
import ActivityLogBoard from "./ksis/pages/log/ActivityLogBoard.jsx";
import fetcher from "./fetcher";
import Error403 from "./ksis/pages/main/error403.jsx";
import ResolutionList from "./ksis/pages/resolution/ResolutionList.jsx";
import SignagePlayKeyPage from "./ksis/pages/signage/SignagePlayKeyPage.jsx";
import TrashImageFileBoard from "./ksis/pages/trash/TrashImageFileBoard.jsx";
import TrashVideoFileBoard from "./ksis/pages/trash/TrashVideoFileBoard.jsx";
import TrashNoticeBoard from "./ksis/pages/trash/TrashNoticeBoard.jsx";
import { EventSourcePolyfill } from "event-source-polyfill";
import { decodeJwt } from "./decodeJwt";

function App() {
  const location = useLocation();
  // 사이드바를 숨기고 싶은 경로들
  const noSidebarRoutes = ["/downloadApp", "/signageplay"];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [marginClass, setMarginClass] = useState("ml-64");
  const [paddingClass, setPaddingClass] = useState("p-4");
  const [isSidebarOpen, setIsSidebarOpen] = useState(windowWidth >= 1024);
  // 현재 경로가 사이드바를 숨기고 싶은 경로에 있는지 확인
  const isNoSidebarRoute = noSidebarRoutes.includes(location.pathname);
  const accessToken = localStorage.getItem("accessToken");
  const computedMarginClass =
    location.pathname === "/downloadApp" ? "" : marginClass;

  const computedPaddingClass =
    location.pathname === "/downloadApp" ? "" : paddingClass;

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  window.addEventListener("storage", (event) => {
    if (event.key === "accessToken" && event.newValue === null) {
      // 로그아웃 처리
      window.location.href = "/downloadApp";
    }
  });

  const logout = () => {
    alert("로그아웃 되었습니다.");
    localStorage.removeItem("accessToken");
    window.location.href = "/downloadApp";
  };

  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  useEffect(() => {
    if (windowWidth >= 1024) {
      if (isSidebarOpen) {
        setMarginClass("ml-64"); // 큰 사이드바 열림
      } else {
        setMarginClass("ml-16"); // 큰 사이드바 닫힘
      }
    } else {
      setMarginClass("ml-16"); // 작은 화면에서는 항상 축소된 마진
    }
  }, [windowWidth, isSidebarOpen]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      fetcher
        .post(TOKEN_CHECK)
        .then((response) => {
          if (response.data.logout) {
            logout();
          }
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
        });
    } else {
      localStorage.removeItem("accessToken");
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="dashboard flex">
      {/* 사이드바를 조건부로 렌더링 */}
      {!isNoSidebarRoute && accessToken && (
        <Sidebar onToggleSidebar={handleSidebarToggle} />
      )}
      <div
        className={`content flex-1 ${computedMarginClass} ${computedPaddingClass}`}
      >
        <Routes>
          <Route path={TOKEN_CALLBACK} element={<TokenCallback />} />
          <Route path={"/downloadApp"} element={<DownloadApp />} />

          <Route element={<ProtectedRoute />}>
            <Route path={MAIN} element={<Main />} />

            {/* 계정 관련 경로 */}
            <Route path={ACCOUNT_FORM} element={<AccountRegForm />} />
            <Route path={ACCOUNT_LIST_BOARD} element={<AccountList />} />
            <Route path={ACCOUNT_EDIT_FORM} element={<AccountEditForm />} />

            {/* PC 관련 경로 */}
            <Route path={PC_INVENTORY} element={<PcList />} />
            <Route path={PC_FORM} element={<PcForm />} />
            <Route path={PC_DTL + "/:id"} element={<PcDtl />} />
            <Route path={PC_UPDATE_FORM + "/:id"} element={<PcUpdateForm />} />

            {/* Signage 관련 경로 */}
            <Route path={SIGNAGE_INVENTORY} element={<SignageList />} />
            <Route path={SIGNAGE_FORM} element={<SignageForm />} />
            <Route path={SIGNAGE_GRID} element={<SignageGrid />} />
            <Route path={SIGNAGE_DTL + "/:id"} element={<SignageDtl />} />
            <Route
              path={SIGNAGE_UPDATE_FORM + "/:id"}
              element={<SignageUpdateForm />}
            />

            {/* API 관련 경로 */}
            <Route path={API_BOARD} element={<ApiBoard />} />
            <Route path={API_FORM} element={<ApiForm />} />
            <Route path={API_FORM + "/:apiId"} element={<ApiForm />} />

            {/* File Size 관련 경로 */}
            <Route path={FILESIZE_FORM} element={<FileSizeBoard />} />

            {/* 공지사항 관련 경로 */}
            <Route path={NOTICE_BOARD} element={<NoticeBoard />} />
            <Route path={NOTICE_FORM} element={<NoticeForm />} />
            <Route path={NOTICE_FORM + "/:noticeId"} element={<NoticeForm />} />
            <Route path={NOTICE_DTL + "/:noticeId"} element={<NoticeDtl />} />

            {/* 미디어관리 관련 경로 */}
            <Route path={IMAGE_FILE_BOARD} element={<ImageFileBoard />} />
            <Route
              path={IMAGE_RESOURCE_BOARD}
              element={<ImageResourceBoard />}
            />
            <Route path={VIDEO_FILE_BOARD} element={<VideoFileBoard />} />
            <Route
              path={VIDEO_RESOURCE_BOARD}
              element={<VideoResourceBoard />}
            />
            <Route
              path={IMAGE_RESOURCE_MODAL + "/:originalResourceId"}
              element={<ImageResourceModal />}
            />
            <Route
              path={IMAGE_ENCODING + "/:originalResourceId"}
              element={<ImageEncoding />}
            />
            <Route
              path={VIDEO_RESOURCE_MODAL + "/:originalResourceId"}
              element={<VideoResourceModal />}
            />
            <Route
              path={VIDEO_ENCODING + "/:originalResourceId"}
              element={<VideoEncoding />}
            />

            {/* 로그 */}
            <Route path={ACCESSLOG_INVENTORY} element={<AccessLogBoard />} />
            <Route
              path={ACTIVITYLOG_INVENTORY}
              element={<ActivityLogBoard />}
            />
            <Route path={UPLOADLOG_INVENTORY} element={<UploadLogBoard />} />

            {/* 해상도 */}
            <Route path={RESOLUTION_LIST} element={<ResolutionList />} />

            {/* 휴지통 */}
            <Route path={TRASH_IMAGE_FILE} element={<TrashImageFileBoard />} />
            <Route path={TRASH_VIDEO_FILE} element={<TrashVideoFileBoard />} />
            <Route path={TRASH_NOTICE} element={<TrashNoticeBoard />} />
            <Route
              path={DEACTIVE_NOTICE_DTL + "/:noticeId"}
              element={<TrashNoticeDtl />}
            />
          </Route>

          {/* 재생 */}
          <Route path={SIGNAGE_PLAY_PAGE} element={<SignagePlayKeyPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
