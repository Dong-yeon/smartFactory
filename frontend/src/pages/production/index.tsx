import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, message, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number; // 0-based page index
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
import type { ColumnsType } from 'antd/es/table';

interface ProductionItem {
  id: number;
  orderNumber: string; // 주문번호
  productCode: string; // 제품코드
  quantity: number; // 주문수량
  orderDate: string; // 주문일자
  dueDate: string; // 납기일자
  status: string; // 상태
}

const Production: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ProductionItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: ColumnsType<ProductionItem> = [
    {
      title: '주문번호',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '제품코드',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '주문일시',
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: '납기일자',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const fetchProductions = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const api = axios.create({
        baseURL: '/api',
      });
      const response = await api.get<PageResponse<ProductionItem>>('/production/orders', {
        params: {
          page: page - 1,
          size: pageSize,
        },
      });
      console.log(response.data);
      setData(response.data.content); // Spring Data returns content array
      setPagination({
        ...pagination,
        total: response.data.totalElements,
        current: (response.data.number || 0) + 1,
        pageSize: response.data.size,
      });
    } catch (error) {
      console.error('생산 데이터를 불러오는 중 오류가 발생했습니다:', error);
      message.error('생산 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchProductions(pagination.current, pagination.pageSize);
  };

  return (
    <div>
      <Title level={2}>생산 관리</Title>
      <Card>  
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Production;
