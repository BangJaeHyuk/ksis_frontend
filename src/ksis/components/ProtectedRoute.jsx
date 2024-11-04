// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        if (!accessToken) {
            alert("접근할 수 없습니다. 다운로드 페이지로 이동합니다.");
        }
    }, [accessToken]);

    if (!accessToken) {
        return <Navigate to="/downloadApp" />;
    }

    return <Outlet />; // 보호된 경로의 자식 요소들을 렌더링
}

export default ProtectedRoute;
