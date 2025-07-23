import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  ToolOutlined,
  InboxOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import useAuth from '@/hooks/useAuth';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        프로필
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        로그아웃
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'master-data',
      icon: <InboxOutlined />,
      label: '기준정보',
      children: [
        {
          key: '/master/item',
          label: '자재관리',
          onClick: () => navigate('/master/item')
        },
        {
          key: '/master/product',
          label: '제품관리',
          onClick: () => navigate('/master/product')
        },
        {
          key: '/master/process',
          label: '공정관리',
          onClick: () => navigate('/master/process')
        },
        {
          key: '/master/product-process',
          label: '제품별 공정관리',
          onClick: () => navigate('/master/product-process')
        }
      ]
    },
    {
      key: 'production',
      icon: <AppstoreOutlined />,
      label: '생산 관리',
      children: [
        {
          key: '/production/plan',
          label: '생산계획관리',
          onClick: () => navigate('/production/plan')
        },
        {
          key: '/production/work-order',
          label: '작업지시관리',
          onClick: () => navigate('/production/work-order')
        }
      ]
    },
    {
      key: '/quality',
      icon: <LineChartOutlined />,
      label: '품질 관리',
      onClick: () => navigate('/quality')
    },
    {
      key: '/equipment',
      icon: <ToolOutlined />,
      label: '설비 관리',
      onClick: () => navigate('/equipment')
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: '재고 관리',
      onClick: () => navigate('/inventory')
    },
    {
      key: '/worker',
      icon: <TeamOutlined />,
      label: '근태 관리',
      onClick: () => navigate('/worker')
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '설정',
      onClick: () => navigate('/settings')
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: colorBgContainer,
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        }}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'SF' : 'Smart Factory'}
          </h2>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: '24px',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', padding: '0 12px' }}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || '사용자'}</span>
              </Space>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
