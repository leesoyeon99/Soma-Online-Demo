// API 연동결과코드
export const API_RES_CODE = {
    SUCCESS: '0000',
    ERR_NETWORK: '1001',            // 실행 중 네트워크가 끊긴 경우
    ERR_SERVICE: '1002',            // 서버 장애, 서비스 점검시
    ERR_VERSION: '1003',            // 프로그램 버전이 업데이트 된 경우
    ERR_DUP_LOGIN: '2001',          // 중복 로그인한 경우
    ERR_INVALID_MEMBER: '2020',     // 아이디나 비밀번호 불일치
    ERR_INVALID_SNS: '2025',        // 동일한 SNS 계정이 존해하지 않음
    ERR_IMPROPER_SNS: '2026',       // SNS사용자정보부족
    ERR_INVALID_TOKEN: '4001',      // 토큰이 없거나 토큰정보불일치
    ERR_TOKEN_EXPIRE: '4002',       // 토큰만료
    UNKNOWN: '9999'                 // 알수 없는 오류
};
