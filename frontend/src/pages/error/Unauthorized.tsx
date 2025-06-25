import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Result
      status="403"
      title="403"
      subTitle="죄송합니다. 이 페이지에 접근할 권한이 없습니다."
      extra={
        <>
          <Button type="primary" onClick={() => navigate('/')} style={{ marginRight: 8 }}>
            홈으로
          </Button>
          <Button onClick={() => navigate('/login')}>
            로그인
          </Button>
        </>
      }
    />
  );
};

export default Unauthorized;
