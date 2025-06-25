import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Production: React.FC = () => {
  return (
    <div>
      <Title level={2}>생산 관리</Title>
      <Card>
        <p>생산 관리 페이지가 여기에 표시됩니다.</p>
      </Card>
    </div>
  );
};

export default Production;
