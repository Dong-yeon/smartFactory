import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Equipment: React.FC = () => {
  return (
    <div>
      <Title level={2}>설비 관리</Title>
      <Card>
        <p>설비 관리 페이지가 여기에 표시됩니다.</p>
      </Card>
    </div>
  );
};

export default Equipment;
