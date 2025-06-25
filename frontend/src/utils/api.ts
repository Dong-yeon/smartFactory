import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { useAuth } from '@/hooks/useAuth';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 성공적인 응답 처리
    return response.data;
  },
  (error: AxiosError) => {
    // 에러 처리
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          // 인증 실패 시 로그인 페이지로 리디렉션
          message.error('세션이 만료되었습니다. 다시 로그인해주세요.');
          // 로그아웃 처리
          const { logout } = useAuth();
          logout();
          break;
          
        case 403:
          message.error('접근 권한이 없습니다.');
          break;
          
        case 404:
          message.error('요청하신 리소스를 찾을 수 없습니다.');
          break;
          
        case 500:
          message.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          break;
          
        default:
          message.error('알 수 없는 오류가 발생했습니다.');
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      message.error('서버로부터 응답을 받지 못했습니다. 네트워크 상태를 확인해주세요.');
    } else {
      // 요청 설정 중에 오류가 발생한 경우
      message.error('요청을 처리하는 중 오류가 발생했습니다.');
    }
    
    return Promise.reject(error);
  }
);

// HTTP 메서드 래퍼 함수
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.get(url, config),
  
  post: <T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => 
    api.post(url, data, config),
  
  put: <T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => 
    api.put(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.delete(url, config),
  
  patch: <T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => 
    api.patch(url, data, config),
};

export default api;
