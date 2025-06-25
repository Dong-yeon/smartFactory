import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Settings: React.FC = () => {
  return (
    <div>
      <Title level={2}>시스템 설정</Title>
      <Card>
        <p>시스템 설정 페이지가 여기에 표시됩니다.</p>
      </Card>
    </div>
  );
};

export default Settings;
