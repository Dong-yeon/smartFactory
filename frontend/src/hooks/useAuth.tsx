import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  token: string;
  loading: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: '',
    loading: true
  });
  
  const { user, token, loading } = authState;
  const navigate = useNavigate();
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token') || '';
      
      setAuthState({
        user: savedUser ? JSON.parse(savedUser) : null,
        token: savedToken,
        loading: false
      });
    };
    
    initializeAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      // TODO: 실제 로그인 API 호출로 대체
      // const response = await api.post('/auth/login', { username, password });
      // const { user, token } = response.data;
      
      // For demo purposes, accept any non-empty username/password
      if (!username.trim() || !password.trim()) {
        throw new Error('아이디와 비밀번호를 입력해주세요.');
      }
      
      // 테스트용 더미 데이터 (사용자명을 반영)
      const mockUser = {
        id: 1,
        username: username,
        name: username === 'admin' ? '관리자' : '사용자',
        email: `${username}@smartFactory.com`,
        role: username === 'admin' ? 'admin' : 'user',
        avatar: null,
      };
      
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      // 로컬 스토리지에 사용자 정보와 토큰 저장
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      
      // 상태 업데이트
      setAuthState({
        user: mockUser,
        token: mockToken,
        loading: false
      });
      
      message.success('로그인되었습니다.');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      message.error('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      return { success: false, error };
    }
  }, []);

  const logout = useCallback(() => {
    // 로컬 스토리지에서 사용자 정보와 토큰 제거
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 상태 초기화
    setAuthState({
      user: null,
      token: '',
      loading: false
    });
    
    // 로그인 페이지로 리디렉션
    navigate('/login');
    
    message.success('로그아웃되었습니다.');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return !!token;
  }, [token]);
  
  const isAuthenticatedValue = isAuthenticated();

  const hasRole = useCallback((requiredRoles: string | string[]) => {
    if (!user) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.some(role => user.role === role);
    }
    
    return user.role === requiredRoles;
  }, [user]);

  return {
    user,
    token,
    loading,
    isAuthenticated: isAuthenticatedValue,
    login,
    logout,
    hasRole,
  };
};

export default useAuth;
