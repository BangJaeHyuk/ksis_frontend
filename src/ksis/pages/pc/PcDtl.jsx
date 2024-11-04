import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import fetcher from "../../../fetcher";
import { PC_LIST } from "../../../constants/api_constant";
import { PC_UPDATE_FORM, PC_INVENTORY } from "../../../constants/page_constant";
import LocationModal from "../../components/LocationModal";
import { decodeJwt } from "../../../decodeJwt";
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";

const PcDtl = () => {
  //불러오기
  const [data, setData] = useState({});
  const params = useParams();
  const [responsibles, setResponsibles] = useState([{ id: 0, accountId: "" }]);
  const userInfo = decodeJwt();
  const [loading, setLoading] = useState(true);

  const loadPcDtl = async (pcId) => {
    try {
      const response = await fetcher.get(PC_LIST + `/${pcId}`);
      const { accountList, ...rest } = response.data;

      if (
        userInfo.roles !== "ROLE_ADMIN" &&
        !response.data.accountList.some(
          (i) => i.accountId === userInfo.accountId
        )
      ) {
        alert("접근권한이 없습니다.");
        navigate(PC_INVENTORY);
      }

      setData(rest);

      setResponsibles(
        accountList.map((account, index) => ({
          id: index,
          accountId: account.accountId,
          accountName: account.name,
        }))
      );

      setLoading(false);
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    loadPcDtl(params.id);
  }, [params.id]);

  // 이전 페이지로 이동
  const navigate = useNavigate();

  const onCancel = () => {
    navigate(-1);
  };

  //위치 지도 보기
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
        일반 PC 상세 조회
      </h1>
      <div className="shadow-sm ring-1 ring-gray-900/5 text-center pt-5 pb-5">
        <div className="flex items-center">
          <label className="w-20 ml-px block pl-4 text-sm font-semibold leading-6 text-gray-900">
            PC 이름
          </label>
          <input
            value={data.deviceName}
            readOnly
            maxLength="50"
            name="deviceName"
            type="text"
            className=" bg-[#ffe69c] block w-80 ml-2 rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        {responsibles.map((responsible, index) => (
          <div key={responsible.id} className="flex items-center mt-5">
            <label className="w-20 ml-px block pl-4 text-sm font-semibold leading-6 text-gray-900">
              담당자{index + 1}
            </label>
            <input
              value={`${responsible.accountName}(${responsible.accountId})`}
              readOnly
              className="bg-[#ffe69c] block w-80 ml-2 rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        ))}
        <div className="flex items-center mt-5">
          <label className="w-20 ml-px block pl-4 text-sm font-semibold  leading-6 text-gray-900">
            위치
          </label>
          <input
            type="text"
            value={data.location}
            readOnly
            className=" bg-[#ffe69c] block w-80 ml-2 rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <button
            onClick={openModal}
            type="button"
            className="ml-2 bg-[#ffe69c] rounded-full px-3 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-yellow-50"
          >
            위치 보기
          </button>
          <LocationModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            address={data.location}
          />
        </div>
        <div className="flex items-center mt-5">
          <label className="w-20 ml-px block pl-4 text-sm font-semibold  leading-6 text-gray-900">
            상세주소
          </label>
          <input
            type="text"
            value={data.detailAddress}
            readOnly
            className=" bg-[#ffe69c] block w-80 ml-2 rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="flex items-center mt-5">
          <label className="w-20 ml-px block pl-4 text-sm font-semibold leading-6 text-gray-900">
            Mac주소
          </label>
          <input
            value={data.macAddress}
            type="text"
            className="block w-80 ml-2 rounded-full border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-[#ffe69c]"
          />
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <Link to={PC_UPDATE_FORM + `/${data.deviceId}`}>
          <ButtonComponentB color="blue">수정하기</ButtonComponentB>
        </Link>
        <ButtonComponentB onClick={onCancel} color="red">
          뒤로가기
        </ButtonComponentB>
      </div>
    </div>
  );
};

export default PcDtl;
