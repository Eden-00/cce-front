// src/api/axios.ts
import axios from 'axios';
import { API_BASE_URL } from './endpoints';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (예: 토큰 추가)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 응답 데이터 가공
    return response;
  },
  (error) => {
    // 에러 처리 (예: 401 에러 시 로그아웃)
    if (error.response && error.response.status === 401) {
      // 로그아웃 처리
      localStorage.removeItem('token');
      window.location.href = '/activate';
    }
    return Promise.reject(error);
  }
);

export default apiClient;