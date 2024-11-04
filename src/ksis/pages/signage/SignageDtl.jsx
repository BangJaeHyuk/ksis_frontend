import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import fetcher from "../../../fetcher";
import {
  SIGNAGE_LIST,
  SIGNAGE_PLAYLIST,
  SIGNAGE_UPDATE,
} from "../../../constants/api_constant";
import {
  SIGNAGE_UPDATE_FORM,
  SIGNAGE_INVENTORY,
} from "../../../constants/page_constant";
import LocationModal from "../../components/LocationModal";
import { Switch } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import NoticeModal from "./NoticeModal";
import SignagePlaylistModal from "./SignagePlaylistModal";
import PlaylistUpdateModal from "./PlaylistUpdateModal";
import SignagePlay from "./SignagePlay";
import { decodeJwt } from "../../../decodeJwt";
import { BsPlusSquare } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";
import { FaRegMap } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import Loading from "../../components/Loading";
import ButtonComponent from "../../components/ButtonComponent";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "../../css/alert";
import { Button } from "../../css/button";

const SignageDtl = () => {
  const userInfo = decodeJwt();
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isCopied, setIsCopied] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [radiobox, setRadiobox] = useState(null);

  //불러오기
  const [data, setData] = useState({});
  const params = useParams();
  const [playlists, setPlaylists] = useState([]);

  const [playlistDtl, setPlaylistDtl] = useState([]);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [slideTime, setSlideTime] = useState(null);
  const [playListId, setPlayListId] = useState(null);

  //위치 지도 보기
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  //공지 조회
  const [noticeModalIsOpen, setNoticeModalIsOpen] = useState(false);
  const openNoticeModal = () => setNoticeModalIsOpen(true);
  const closeNoticeModal = () => setNoticeModalIsOpen(false);

  //재생목록 추가
  const [playlistAddIsOpen, setPlaylistAddIsOpen] = useState(false);
  const openPlaylistAdd = () => setPlaylistAddIsOpen(true);
  const closePlaylistAdd = () => setPlaylistAddIsOpen(false);

  //재생목록 수정
  const [playlistUpdateIsOpen, setPlaylistUpdateIsOpen] = useState(false);
  const openPlaylistUpdate = () => setPlaylistUpdateIsOpen(true);
  const closePlaylistUpdate = () => setPlaylistUpdateIsOpen(false);

  //재생
  const [playIsOpen, setPlayIsOpen] = useState(false);
  const openPlay = () => setPlayIsOpen(true);
  const closePlay = () => setPlayIsOpen(false);

  // 이전 페이지로 이동
  const navigate = useNavigate();

  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림창 상태 추가
  const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지 상태 추가
  const [confirmAction, setConfirmAction] = useState(null); // 확인 버튼을 눌렀을 때 실행할 함수

  // 알림창 메서드
  const showAlert = (message, onConfirm = null) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
    setConfirmAction(() => onConfirm); // 확인 버튼을 눌렀을 때 실행할 액션
  };

  const onCancel = () => {
    navigate(-1);
  };

  const loadSignageDtl = async (signageId) => {
    try {
      const response = await fetcher.get(SIGNAGE_LIST + `/${signageId}`);
      console.log("Signage response:", response);
      setData(response.data);

      if (
        userInfo.roles !== "ROLE_ADMIN" &&
        !response.data.accountList.some(
          (i) => i.accountId === userInfo.accountId
        )
      ) {
        showAlert("접근권한이 없습니다.", () => {});
        navigate(SIGNAGE_INVENTORY);
      }

      loadPlayList(signageId);
      setEnabled(response.data.isShow);

      setLoading(false);
    } catch (error) {
      console.log(error.response);
    }
  };

  const loadPlayList = async (signageId) => {
    const playlistResponse = await fetcher.get(
      SIGNAGE_PLAYLIST + `/${signageId}`
    );

    console.log("Playlist data:", playlistResponse);
    setPlaylists(playlistResponse.data);

    const selectedPlaylist = playlistResponse.data.find(
      (playlist) => playlist.play === true
    );
    if (selectedPlaylist) {
      setRadiobox(selectedPlaylist.playlistId);

      onClickPlaylist(
        selectedPlaylist.playlistId,
        selectedPlaylist.title,
        selectedPlaylist.playTime
      );
    }
  };

  useEffect(() => {
    loadSignageDtl(params.id);
  }, []);

  // Switch 상태 변경 핸들러
  const handleToggle = async () => {
    showAlert("공지 표시 여부를 변경하시겠습니까?", async () => {
      const newEnabled = !enabled;
      setEnabled(newEnabled);

      try {
        await fetcher.put(SIGNAGE_UPDATE + `/${data.deviceId}`, {
          showNotice: newEnabled,
        });
        console.log("DB 상태 업데이트 성공");
      } catch (error) {
        console.error("DB 상태 업데이트 실패", error);
      }
    });
  };

  const formattedDate = data.regTime
    ? format(parseISO(data.regTime), "yyyy-MM-dd")
    : "";

  //재생목록 선택
  const onChangeRadio = async (e) => {
    showAlert("재생목록을 변경하시겠습니까?", async () => {
      const selectedRadiobox = Number(e.target.value);
      setRadiobox(selectedRadiobox);

      try {
        await fetcher.put(SIGNAGE_PLAYLIST + `/${data.deviceId}`, {
          selectedPlaylist: selectedRadiobox,
        });
        console.log("DB 상태 업데이트 성공");
      } catch (error) {
        console.error("DB 상태 업데이트 실패", error);
      }
    });
  };

  //재생목록 조회
  const onClickPlaylist = async (playlistId, title, playTime) => {
    try {
      console.log(playlistId);
      const response = await fetcher.get(SIGNAGE_PLAYLIST, {
        params: { playlistDtlId: playlistId },
      });
      console.log(response);

      setPlaylistDtl(response.data);

      setSlideTime(playTime);
      setPlaylistTitle(title);
      setPlayListId(playlistId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //재생목록 수정
  const openPlaylist = () => {
    if (playListId == null) {
      showAlert("수정할 재생목록을 선택하세요.", () => {});
    } else {
      openPlaylistUpdate();
    }
  };

  //재생목록 삭제
  const deletePlaylist = async (playlistId) => {
    try {
      if (playlistId == null) {
        showAlert("삭제할 재생목록을 선택하세요.", () => {});
      } else if (radiobox === playlistId) {
        showAlert(
          "현재 기본으로 선택된 재생목록입니다. 변경 후 삭제해주세요.",
          () => {}
        );
      } else {
        showAlert("삭제하시겠습니까?", async () => {
          const response = await fetcher.delete(SIGNAGE_PLAYLIST, {
            params: { playlistId: playlistId },
          });

          console.log(response.data);

          setPlaylists((prevPlaylists) =>
            prevPlaylists.filter(
              (playlist) => playlist.playlistId !== playlistId
            )
          );

          showAlert("삭제되었습니다.", () => {});

          setPlaylistDtl([]);
          setSlideTime(null);
          setPlaylistTitle("");
        });
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const handleModalClose = async () => {
    await loadPlayList(data.deviceId);
    closePlaylistAdd();
  };

  const handleUpdateMoalClose = async () => {
    await loadPlayList(data.deviceId);
    setPlaylistDtl([]);
    setPlaylistTitle("");
    setSlideTime("");
    setPlayListId("");
    closePlaylistUpdate();
  };

  const copyKey = () => {
    var key =
      API_BASE_URL +
      "/signageplay?key=" +
      document.getElementById("deviceKey").innerText;

    navigator.clipboard.writeText(key).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-10">
      <Alert
        open={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
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
            alertMessage === "삭제되었습니다." ||
            alertMessage ===
              "현재 기본으로 선택된 재생목록입니다. 변경 후 삭제해주세요." ||
            alertMessage === "삭제할 재생목록을 선택하세요." ||
            alertMessage === "수정할 재생목록을 선택하세요." ||
            alertMessage === "접근권한이 없습니다."
          ) && (
            <Button plain onClick={() => setIsAlertOpen(false)}>
              취소
            </Button>
          )}
        </AlertActions>
      </Alert>

      <PlaylistUpdateModal
        isOpen={playlistUpdateIsOpen}
        onRequestClose={handleUpdateMoalClose}
        signageId={data.deviceId}
        playlistId={playListId}
      />

      <div className="flex justify-between mb-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900">
          재생장치 설정
        </h1>
        <div className="flex justify-between items-end">
          <div className="ml-2">공지 표시</div>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            className="ml-2 group relative inline-flex h-6 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FCA929] focus:ring-offset-2 data-[checked]:bg-[#FCA929]"
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={`${
                enabled ? "translate-x-10" : "translate-x-0"
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
            <span
              className={`absolute left-2 text-sm font-medium transition duration-200 ease-in-out ${
                enabled ? "opacity-100" : "opacity-0"
              }`}
            >
              ON
            </span>
            <span
              className={`absolute right-2 text-sm font-medium transition duration-200 ease-in-out ${
                enabled ? "opacity-0" : "opacity-100"
              }`}
            >
              OFF
            </span>
          </Switch>
        </div>
      </div>
      <div className="text-center pt-5 pb-5">
        <div className="border-t-2 border-b-2 border-gray-300">
          {/* First Row: Device Name */}
          <div className="flex items-center border-b border-gray-300">
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                재생장치 명
              </label>
              <div className="border-r border-gray-300 h-10"></div>
              <div className="inline-flex items-center bg-white w-full px-4 py-1.5 text-gray-900 h-10">
                {data.deviceName}
              </div>
            </div>
            <div className="border-r border-gray-300 h-10"></div>
            <div className="w-1/2 flex items-center justify-end">
              <Link to={SIGNAGE_UPDATE_FORM + `/${data.deviceId}`}>
                <div className="h-10 relative inline-flex items-center px-3 py-2 font-medium text-blue-600 hover:font-semibold">
                  정보 수정
                </div>
              </Link>
              <div className="h-10 relative inline-flex items-center font-medium text-blue-600 ">
                |
              </div>
              <div
                onClick={openNoticeModal}
                className="cursor-pointer h-10 relative inline-flex items-center px-3 py-2 font-medium text-blue-600 hover:font-semibold"
              >
                공지 조회
              </div>
              <NoticeModal
                isOpen={noticeModalIsOpen}
                onRequestClose={closeNoticeModal}
                signageId={data.deviceId}
              />
            </div>
          </div>

          <div className="flex items-center border-b border-gray-300">
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                담당자
              </label>
              <div className="border-r border-gray-300 h-10"></div>

              <div
                className="block items-center bg-white w-full px-4 py-1.5 text-gray-900 h-10 overflow-hidden text-ellipsis whitespace-nowrap"
                title={
                  data.accountList &&
                  data.accountList
                    .map((account) => `${account.name}(${account.accountId})`)
                    .join(", ")
                }
              >
                {data.accountList &&
                  data.accountList
                    .map((account) => `${account.name}(${account.accountId})`)
                    .join(", ")}{" "}
              </div>
            </div>
            <div className="border-r border-gray-300 h-10"></div>
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                위치
              </label>

              <div className="border-r border-gray-300 h-10"></div>
              <div className="flex relative group w-full">
                <div className="inline-flex items-center bg-white px-4 py-1.5 text-gray-900 h-10">
                  {`${data.location} (${data.detailAddress})`}
                </div>
                <div
                  className="inline-flex items-center text-gray-500 cursor-pointer"
                  onClick={openModal}
                >
                  <FaRegMap className="hover:text-[#FF9C00]" />
                </div>
                <LocationModal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  address={data.location}
                />
                {data.location.length + data.detailAddress.length > 30 && (
                  <span className="absolute left-3 top-5 w-auto p-1 bg-gray-100 text-sm  opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {data.location} ({data.detailAddress})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center border-b border-gray-300">
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                IP
              </label>
              <div className="border-r border-gray-300 h-10"></div>
              <div className="inline-flex items-center bg-white w-full px-4 py-1.5 text-gray-900 h-10">
                {data.ipAddress}
              </div>
            </div>
            <div className="border-r border-gray-300 h-10"></div>
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                KEY
              </label>
              <div className="border-r border-gray-300 h-10"></div>
              <div className="relative group w-full flex">
                <div
                  className="inline-flex items-center rounded-md bg-white px-4 py-1.5 text-gray-900 h-10"
                  id="deviceKey"
                >
                  {data.deviceKey}
                </div>
                <div
                  className="inline-flex items-center text-gray-500 cursor-pointer"
                  onClick={copyKey}
                >
                  {isCopied ? (
                    <FaCheck className="text-[#FF9C00]" />
                  ) : (
                    <FaRegCopy className="hover:text-[#FF9C00]" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center border-b border-gray-300">
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                해상도
              </label>
              <div className="border-r border-gray-300 h-10"></div>
              <div className="inline-flex items-center bg-white w-full px-4 py-1.5 text-gray-900 h-10">
                {data.resolution}
              </div>
            </div>
            <div className="border-r border-gray-300 h-10"></div>
            <div className="w-1/2 flex items-center">
              <label className="pl-2 w-1/4 text-gray-700 font-medium text-left bg-gray-100 h-10 flex items-center">
                사이즈
              </label>
              <div className="border-r border-gray-300 h-10"></div>
              <div className="relative group w-full">
                <div className="inline-flex items-center bg-white  w-full px-4 py-1.5 text-gray-900 h-10">
                  {data.screenSize}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-5">
          <div className="flex-1 border border-gray-300 px-4 py-4 h-160">
            <div className="flex items-center justify-between space-x-2 mr-1 h-8">
              <div className="text-lg font-semibold ml-2">재생목록 내역</div>
              <div
                className="relative inline-block cursor-pointer"
                onClick={openPlaylistAdd}
              >
                <BsPlusSquare
                  size="22"
                  className="text-gray-700 hover:text-[#FF9C00]"
                />
                <SignagePlaylistModal
                  isOpen={playlistAddIsOpen}
                  onRequestClose={handleModalClose}
                  signageId={data.deviceId}
                  className="z-50"
                />
              </div>
            </div>
            <div className="h-145 overflow-y-auto my-3">
              <table className="min-w-full divide-y divide-gray-300 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2">재생목록명</th>
                    <th className="border border-gray-400 p-2">등록일</th>
                    <th className="border border-gray-400 p-2">선택</th>
                  </tr>
                </thead>
                <tbody>
                  {playlists.map((playlist) => (
                    <tr
                      key={playlist.playlistId}
                      onClick={() =>
                        onClickPlaylist(
                          playlist.playlistId,
                          playlist.title,
                          playlist.playTime
                        )
                      }
                      className="cursor-pointer"
                    >
                      <td
                        className={`border border-gray-400 p-2 cursor-pointer hover:underline ${
                          playListId === playlist.playlistId
                            ? " font-bold underline"
                            : ""
                        }`}
                      >
                        {playlist.title}
                      </td>
                      <td className="border border-gray-400 p-2">
                        {format(parseISO(playlist.regTime), "yyyy-MM-dd")}
                      </td>
                      <td className="border border-gray-400 p-2">
                        <input
                          type="radio"
                          className="border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer"
                          value={playlist.playlistId}
                          onChange={onChangeRadio}
                          name="selectedPlaylist"
                          checked={radiobox === playlist.playlistId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-8 flex justify-end">
              <ButtonComponent onClick={openPlay} color="orange">
                미리보기
              </ButtonComponent>
              <SignagePlay
                isOpen={playIsOpen}
                onRequestClose={closePlay}
                signageId={data.deviceId}
              />
            </div>
          </div>
          <div className="flex-1 border border-gray-300 ml-2 px-4 py-4 h-160">
            <div className="flex items-center justify-between h-8">
              <div className="text-lg font-semibold ml-2">{playlistTitle}</div>
              <div className="">Slide Time: {slideTime} (s)</div>
            </div>

            <div className="overflow-y-auto h-145 my-3">
              <div className="grid gap-x-3 gap-y-3 md:grid-cols-3 grid-cols-2">
                {playlistDtl.map((resource) => (
                  <div
                    key={resource.encodedResourceId}
                    className="group relative border border-gray-900"
                  >
                    <div className="absolute top-0 left-0 m-2 rounded-full border border-black bg-gray-200 h-6 w-6 flex items-center justify-center">
                      {resource.sequence}
                    </div>

                    <div className="w-full h-full overflow-hidden lg:h-48">
                      <img
                        src={resource.thumbFilePath}
                        alt={resource.fileTitle}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="relative group text-gray-700 text-center w-full p-1 bg-white">
                      <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                        {resource.fileTitle}
                      </p>

                      <span className="absolute left-0 w-auto p-1 z-10 bg-gray-100 text-sm  opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {resource.fileTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-8 items-center flex justify-end mt-2">
              <ButtonComponent onClick={openPlaylist} color="blue">
                수정
              </ButtonComponent>
              <ButtonComponent
                onClick={() => deletePlaylist(playListId)}
                color="red"
              >
                삭제
              </ButtonComponent>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center mt-5 justify-between">
          <Link to={SIGNAGE_INVENTORY}>
            <button
              type="button"
              className="text-white rounded-sm bg-gray-500 px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-400"
            >
              목록
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default SignageDtl;
