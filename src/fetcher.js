import axios from "axios";
import { TOKEN_CALLBACK } from "./constants/account_constant";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const token = localStorage.getItem("accessToken");
const fetcher = axios.create({
  baseURL: API_BASE_URL,
  headers: {},
});

// 요청 인터셉터 설정
fetcher.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 요청 헤더에 토큰 추가
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정 (옵션)
fetcher.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 403) {
      if (token) {
        // 만료된 액세스 토큰 갱신 요청
        let response;
        try {
          response = await fetcher.post(`${TOKEN_CALLBACK}`, null, {
            headers: {
              Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 담기
            },
          });
        } catch (err) {
          return Promise.resolve();
        }
        // 리프레시 토큰이 만료된 경우
        if (!response.data) {
          localStorage.removeItem("accessToken");
          window.location.href = "/downloadApp";
          window.location.href = "ksis://open";
          return Promise.resolve();
        }

        const { accessToken: newAccessToken } = response.data;

        // 갱신된 액세스 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);
        // 갱신된 액세스 토큰으로 재요청
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(error.config);
      }
      return Promise.resolve();
    }
    return Promise.reject(error);
  }
);

export default fetcher;
