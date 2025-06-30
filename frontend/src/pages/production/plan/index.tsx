import React, { useState, useEffect, useCallback } from 'react';
import { Table, message, Typography } from 'antd';
import { Input, Select, Row, Col, Button, Modal, Form, DatePicker, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { Search } = Input;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 생산 주문 폼 컴포넌트
const ProductionOrderForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSave: (values: ProductionOrderRequest) => void;
  loading: boolean;
}> = ({ visible, onCancel, onSave, loading }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="생산 주문 생성"
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="저장"
      cancelText="취소"
    >
      <Form
        form={form}
        onFinish={onSave}
        initialValues={{
          quantity: 1
        }}
      >
        <Form.Item
          name="productCode"
          label="제품 코드"
          rules={[{ required: true, message: '제품 코드를 입력해주세요' }]}
        >
          <Input placeholder="제품 코드를 입력하세요" />
        </Form.Item>
        
        <Form.Item
          name="quantity"
          label="수량"
          rules={[{ required: true, message: '수량을 입력해주세요' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="dueDate"
          label="납기일"
          rules={[{ required: true, message: '납기일을 선택해주세요' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              // 오늘 이전 날짜는 선택 불가
              return current && current < moment().startOf('day');
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

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

interface ProductionItem {
  id: number;
  orderNumber: string; // 주문번호
  productCode: string; // 제품코드
  quantity: number; // 주문수량
  orderDate: string; // 주문일자
  dueDate: string; // 납기일자
  status: string; // 상태
}

interface ProductionOrderRequest {
  productCode: string;
  quantity: number;
  dueDate: string;
}

interface SearchParams {
  page: number;
  size: number;
  orderNumber: string;
  productCode: string;
  status: string;
}

interface SearchBarProps {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  fetchProductions: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchParams, setSearchParams, fetchProductions }) => {
  // 로컬 상태로 입력값 관리
  const [localParams, setLocalParams] = useState<SearchParams>(searchParams);

  // searchParams가 변경될 때 로컬 상태 동기화
  useEffect(() => {
    setLocalParams(searchParams);
  }, [searchParams]);

  // 검색 실행 함수
  const handleSearch = () => {
    setSearchParams({
      ...localParams,
      page: 0 // 검색 시 첫 페이지로 리셋
    });
    fetchProductions();
  };

  // 초기화 함수
  const handleReset = () => {
    const resetParams = {
      page: 0,
      size: 10,
      orderNumber: '',
      productCode: '',
      status: ''
    };
    setLocalParams(resetParams);
    setSearchParams(resetParams);
    fetchProductions();
  };

  // 입력 필드 변경 핸들러
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setLocalParams((prev: typeof searchParams) => ({
      ...prev,
      [field]: value
    }));
  };

  // 입력 필드 변경 핸들러 (명시적인 타입 지정)
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const value = typeof e === 'string' ? e : e.target?.value ?? '';
    setLocalParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 검색어 지우기 핸들러 - 클릭한 검색바만 초기화
  const handleClear = (field: string) => () => {
    // 로컬 상태 업데이트
    const updatedLocalParams = { ...localParams, [field]: '' };
    setLocalParams(updatedLocalParams);
    
    // 검색 파라미터 업데이트 및 검색 실행
    const updatedSearchParams = { ...searchParams, [field]: '' };
    setSearchParams(updatedSearchParams);
    
    // 검색 실행 (이전 상태가 아닌 최신 상태로 검색)
    fetchProductions();
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Search
            placeholder="주문번호 검색"
            value={localParams.orderNumber}
            onChange={handleInputChange('orderNumber')}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            onClear={handleClear('orderNumber')}
            enterButton
            allowClear
          />
        </Col>
        <Col span={8}>
          <Search
            placeholder="제품코드 검색"
            value={localParams.productCode}
            onChange={handleInputChange('productCode')}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            onClear={handleClear('productCode')}
            enterButton
            allowClear
          />
        </Col>
        <Col span={8}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Select
              placeholder="상태 선택"
              style={{ flex: 1 }}
              allowClear
              value={localParams.status || undefined}
              onChange={handleChange('status')}
            >
              <Option value="대기중">대기중</Option>
              <Option value="진행중">진행중</Option>
              <Option value="완료">완료</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              검색
            </Button>
            <Button onClick={handleReset}>
              초기화
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const ProductionPlan: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ProductionItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10,
    orderNumber: '',
    productCode: '',
    status: '',
  });

  const fetchProductions = async () => {
    try {
      setLoading(true);
      
      // 백엔드에 보낼 파라미터 준비
      const params = {
        page: searchParams.page,
        size: searchParams.size,
        orderNumber: searchParams.orderNumber || undefined,
        productCode: searchParams.productCode || undefined,
        status: searchParams.status || undefined,
      };

      // console.log('API 요청 파라미터:', params);
      const response = await axios.get<PageResponse<ProductionItem>>('/api/production/plans', { 
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });
      
      // console.log('API 응답 데이터:', response.data);
      const responseData = response.data;
      setData(responseData.content);
      setPagination({
        ...pagination,
        total: responseData.totalElements,
        current: responseData.pageable.pageNumber + 1, // 0-based to 1-based
        pageSize: responseData.pageable.pageSize
      });
    } catch (error) {
      message.error('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching productions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, [searchParams.page, searchParams.size]);

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
      title: '주문수량',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '주문일자',
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

  const handleTableChange = (pagination: any) => {
    setSearchParams(prev => ({
      ...prev,
      page: pagination.current - 1,
      size: pagination.pageSize,
    }));
  };

  const memoizedFetchProductions = useCallback(fetchProductions, [searchParams]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>생산 관리</Typography.Title>
        <Button 
          type="primary" 
          onClick={() => setIsModalVisible(true)}
          icon={<PlusOutlined />}
        >
          생산 주문 생성
        </Button>
      </div>
      
      <ProductionOrderForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={async (values) => {
          try {
            setIsSubmitting(true);
            // Format the date string to ensure it's in the correct format
            const formattedValues = {
              ...values,
              dueDate: moment(values.dueDate).format('YYYY-MM-DD')
            };
            
            const response = await axios.post('/api/production/plans', formattedValues, {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 5000, // 5초 타임아웃 설정
            });
            
            console.log('Server response:', response);
            
            message.success('생산 주문이 생성되었습니다.');
            // 폼 초기화는 ProductionOrderForm 컴포넌트의 form 인스턴스를 사용해야 함
            // form.resetFields(); // 이 부분은 제거
            setIsModalVisible(false);
            fetchProductions(); // 목록 새로고침
          } catch (error: any) {
            console.error('생산 주문 생성 실패:', error);
            
            if (error.response) {
              // 서버가 응답을 반환했지만 오류 상태 코드가 반환된 경우
              console.error('Error response data:', error.response.data);
              console.error('Error status:', error.response.status);
              console.error('Error headers:', error.response.headers);
              message.error(`서버 오류: ${error.response.data?.message || '알 수 없는 오류가 발생했습니다.'}`);
            } else if (error.request) {
              // 요청이 전송되었지만 응답을 받지 못한 경우
              console.error('No response received:', error.request);
              message.error('서버로부터 응답을 받지 못했습니다. 서버가 실행 중인지 확인해주세요.');
            } else {
              // 요청 설정 중에 오류가 발생한 경우
              console.error('Error message:', error.message);
              message.error(`요청 중 오류가 발생했습니다: ${error.message}`);
            }
          } finally {
            setIsSubmitting(false);
          }
        }}
        loading={isSubmitting}
      />
      <SearchBar 
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        fetchProductions={memoizedFetchProductions}
      />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}건`,
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
}

export default ProductionPlan;
