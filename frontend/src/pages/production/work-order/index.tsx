import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const ProductionWorkOrder: React.FC = () => {
  return (
    <div>
      <Title level={2}>작업 지시 관리</Title>
      <p>이곳에 작업 지시 관리 내용이 표시됩니다.</p>
    </div>
  );
};

export default ProductionWorkOrder;
