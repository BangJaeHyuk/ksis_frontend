// utils/auth.js
import { jwtDecode } from 'jwt-decode';

export const decodeJwt = () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return {
                accountId: decodedToken.sub, // 토큰에서 계정 ID 가져오기
                roles: decodedToken.auth,    // 토큰에서 권한 정보 가져오기
            };
        } catch (error) {
            return null;
        }
    }

    return null;
};
