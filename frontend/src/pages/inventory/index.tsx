import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Inventory: React.FC = () => {
  return (
    <div>
      <Title level={2}>재고 관리</Title>
      <Card>
        <p>재고 관리 페이지가 여기에 표시됩니다.</p>
      </Card>
    </div>
  );
};

export default Inventory;
