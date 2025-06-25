import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import useAuth from '@/hooks/useAuth';

interface LocationState {
  from?: string;
}

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const from = (location.state as LocationState)?.from || '/';

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success) {
        message.success('로그인되었습니다.');
        // Redirect to the original requested page or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      message.error(errorMessage);
      form.setFields([
        { name: 'password', errors: [''] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '24px'
    }}>
      <Card 
        style={{
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            스마트공장 MES 시스템
          </Title>
          <Typography.Text type="secondary">관리자 계정으로 로그인해주세요</Typography.Text>
        </div>
        
        <Form
          name="login"
          form={form}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
              placeholder="아이디"
              autoComplete="username"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </Form.Item>
          
          <div style={{ marginBottom: 24 }}>
            <Space>
              <span>아이디/비밀번호를 잊으셨나요?</span>
              <Link to="/forgot-password">비밀번호 찾기</Link>
            </Space>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={loading}
              block
            >
              로그인
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Typography.Text type="secondary">
            © {new Date().getFullYear()} Smart Factory MES. All rights reserved.
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
