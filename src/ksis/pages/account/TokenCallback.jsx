import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MAIN } from "../../../constants/page_constant";
const TokenCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const storeAccessToken = async () => {
      // 쿼리 파라미터에서 accessToken 가져오기
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("accessToken");

      if (!accessToken) {
        return;
      }
      localStorage.setItem("accessToken", accessToken);
      navigate(MAIN);

      window.location.reload();
    };

    storeAccessToken();
  }, [navigate]);

  return null;
};

export default TokenCallback;
