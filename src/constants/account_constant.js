// Pages
export const ACCOUNT_FORM = "/account";
export const ACCOUNT_LIST_BOARD = "/accountList";
export const ACCOUNT_EDIT_FORM = "/account/:accountId";

// Api
export const ACCOUNT_LIST = "/admin/accountList";
export const ACCOUNT_CREATE = "/admin/account";
export const TOKEN_CALLBACK = "/get-token"; // 토큰이 만료되었을 때, 액세스토큰 갱신요청
export const TOKEN_CHECK = "/check-access-token";
// 웹 브라우저를 열었을 떄, 로컬에 액세스 토큰이 남아있을 경우 로그아웃처리가 되었는 지 확인
export const ACCESS_LOG = "/access-log";
export const LOG_OUT = "/logout";

export const EVENT = "/sse/events";
