import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TRASH_NOTICE } from "../../../constants/page_constant";
import { NOTICE_LIST } from "../../../constants/api_constant";
import fetcher from "../../../fetcher";
import { format, parseISO } from "date-fns";
import { decodeJwt } from "../../../decodeJwt";
import { Input } from "../../css/input";
import { Button } from "../../css/button";
import { Textarea } from "../../css/textarea";
import Loading from "../../components/Loading";
import ButtonComponentB from "../../components/ButtonComponentB";

const TrashNoticeDtl = () => {
  const userInfo = decodeJwt();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { noticeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await fetcher.get(NOTICE_LIST + `/${noticeId}`);
        setNotice(response.data);
        if (
          userInfo.roles !== "ROLE_ADMIN" &&
          response.data.accountId !== userInfo.accountId &&
          response.data.role !== "ADMIN"
        ) {
          alert("접근권한이 없습니다.");
          navigate(TRASH_NOTICE);
        }
      } catch (err) {
        setError("공지사항 정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>오류 발생: {error}</p>;
  }

  const handleCancel = () => {
    navigate(TRASH_NOTICE);
  };

  const formatDate = (dateString) => {
    try {
      // parseISO 함수로 변환, 변환 실패 시 catch로 넘어감
      const date = parseISO(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date"; // 오류 발생 시 처리
    }
  };

  return (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="shadow-sm ring-4 ring-gray-900/5 text-center p-6 bg-white rounded-lg w-1/2 min-w-96">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 my-4">
          공지사항 상세
        </h1>
        <br />
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* 제목 */}
            <Input id="title" name="title" value={notice.title} readOnly />

            {/* 내용 */}
            <Textarea id="content" value={notice.content} readOnly rows="15" />

            {/* 날짜 */}
            <div className="rounded-lg p-2 shadow-sm bg-white">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    노출 시작일
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formatDate(notice.startDate)}
                    readOnly
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    노출 종료일
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formatDate(notice.endDate)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex justify-center space-x-4">
              <ButtonComponentB onClick={handleCancel} color="gray">
                뒤로가기
              </ButtonComponentB>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrashNoticeDtl;
