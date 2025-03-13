// src/api/endpoints.ts

// 기본 API URL
export const API_BASE_URL = 'http://13.125.36.244:18586/api/front';

// 자격 증명(Credential) 관련 엔드포인트
export const CREDENTIAL_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/credential-view`,
  GET_BY_ID: (id: string | number) => `${API_BASE_URL}/credential-check/${id}`,
  CREATE: `${API_BASE_URL}/credentials`,
  UPDATE: (id: string | number) => `${API_BASE_URL}/credentials/${id}`,
  DELETE: (id: string | number) => `${API_BASE_URL}/credentials/${id}`
};


// 실행 결과(Result) 관련 엔드포인트
export const RESULT_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/resultlist`,
  GET_FILE_CONTENT: (id: string | number) => `${API_BASE_URL}/resultfile/${id}`
};

// 에이전트(Agent) 관련 엔드포인트
export const AGENT_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/agent-view`,
  GET_BY_ID: `${API_BASE_URL}/agent-detail`,
  CREATE: `${API_BASE_URL}/agent`,
  UPDATE: (id: string | number) => `${API_BASE_URL}/agent/${id}`,
  DELETE: `${API_BASE_URL}/agent-delete`,
  REFRESH: (id: string | number) => `${API_BASE_URL}/agent/${id}/refresh`,
  UPDATE_AGENT: `${API_BASE_URL}/agent-update` // 에이전트 정보 업데이트 엔드포인트 추가
};

// 에이전트(Agent) 실행 엔드포인트
export const EXECUTE_ENDPOINTS = {
  EXECUTE_AGENT: `${API_BASE_URL}/execute-agent`
};
// 다른 API 엔드포인트들은 필요에 따라 추가할 수 있습니다.