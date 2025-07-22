import React, { useState, useEffect, useCallback } from 'react';
import { Table, message, Typography } from 'antd';
import { Input, Select, Row, Col, Button, Modal, Form, InputNumber, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { Search } = Input;
const { Title } = Typography;
const { Option } = Select;

// 제품 등록/수정 폼 컴포넌트
const ItemForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSave: (values: ItemRequest) => void;
  loading: boolean;
  initialValues?: Partial<ItemRequest>;
  itemTypeOptions: { value: string; label: string }[];
  itemUnitOptions: { value: string; label: string }[];
}> = ({ visible, onCancel, onSave, loading, initialValues, itemTypeOptions, itemUnitOptions }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      title={initialValues ? '제품 수정' : '제품 등록'}
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
        initialValues={initialValues || { safetyStock: 0 }}
        layout="vertical"
      >
        <Form.Item
          name="itemType"
          label="제품유형"
          initialValue="FINISHED_PRODUCT"
          rules={[{ required: true, message: '제품유형을 선택해주세요' }]}
        >
          <Select>
            <Select.Option value="FINISHED_PRODUCT">완제품</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="itemCode"
          label="제품 코드"
          rules={[{ required: true, message: '제품 코드를 입력해주세요' }]}
        >
          <Input placeholder="제품 코드를 입력하세요" />
        </Form.Item>
        <Form.Item
          name="itemName"
          label="제품명"
          rules={[{ required: true, message: '제품명을 입력해주세요' }]}
        >
          <Input placeholder="제품명을 입력하세요" />
        </Form.Item>
        <Form.Item
          name="spec"
          label="규격"
        >
          <Input placeholder="규격을 입력하세요" />
        </Form.Item>
        <Form.Item
          name="unit"
          label="단위"
          rules={[{ required: true, message: '단위를 입력해주세요' }]}
        >
        <Select placeholder="단위를 선택하세요">
          {itemUnitOptions
            .filter(opt => !!opt.value)
            .map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))} 
        </Select>
        </Form.Item>
        <Form.Item
          name="safetyStock"
          label="재고수량"
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="사용여부"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageable: { pageNumber: number; pageSize: number };
}

interface Item {
  id: number;
  itemType: string;
  itemCode: string;
  itemName: string;
  spec?: string;
  unit: string;
  safetyStock: number;
  isActive: boolean;
}

interface ItemRequest {
  itemType: string;
  itemCode: string;
  itemName: string;
  spec?: string;
  unit: string;
  safetyStock: number;
  isActive: boolean;
}

interface SearchParams {
  page: number;
  size: number;
  itemCode: string;
  itemName: string;
  isActive: boolean | null;
}

const SearchBar: React.FC<{
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  fetchItems: () => void;
}> = ({ searchParams, setSearchParams, fetchItems }) => {
  const [localParams, setLocalParams] = useState<SearchParams>(searchParams);

  useEffect(() => {
    setLocalParams(searchParams);
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams({ ...localParams, page: 0 });
    fetchItems();
  };

  const handleReset = () => {
    const resetParams = { page: 0, size: 10, itemCode: '', itemName: '', isActive: true };
    setLocalParams(resetParams);
    setSearchParams(resetParams);
    fetchItems();
  };

  const handleInputChange = (field: keyof SearchParams) => (e: any) => {
    let value;
    if (field === 'isActive') {
      value = e === '' ? null : e === 'true';
    } else {
      value = e && e.target ? e.target.value : e;
    }
    setLocalParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <Search
          placeholder="제품코드 검색"
          value={localParams.itemCode}
          onChange={handleInputChange('itemCode')}
          onSearch={handleSearch}
          enterButton
          allowClear
          style={{ minWidth: 160, flex: '0 0 300px' }}
        />
        <Search
          placeholder="제품명 검색"
          value={localParams.itemName}
          onChange={handleInputChange('itemName')}
          onSearch={handleSearch}
          enterButton
          allowClear
          style={{ minWidth: 160, flex: '0 0 300px' }}
        />
        <Select
          placeholder="활성/비활성 전체"
          allowClear
          style={{ minWidth: 120, flex: '0 0 120px' }}
          value={localParams.isActive === null ? '' : String(localParams.isActive)}
          onChange={handleInputChange('isActive')}
        >
          <Select.Option value="">전체</Select.Option>
          <Select.Option value="true">활성</Select.Option>
          <Select.Option value="false">비활성</Select.Option>
        </Select>
        <Button type="primary" onClick={handleSearch} style={{ marginRight: 4 }}>
          검색
        </Button>
        <Button onClick={handleReset}>
          초기화
        </Button>
      </div>
    </div>
  );
};

const ItemManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Item[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemTypeOptions, setItemTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [itemUnitOptions, setItemUnitOptions] = useState<{ value: string; label: string }[]>([]);

  // 제품유형 목록 불러오기
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        const response = await axios.get('/api/master/items/types');
        setItemTypeOptions(
          (response.data as any[]).map((t: any) => ({ value: t.code, label: t.name }))
        );
      } catch (err) {
        setItemTypeOptions([]);
      }
    };
    fetchItemTypes();
  }, []);

  // 단위 목록 불러오기
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        const response = await axios.get('/api/master/items/units');
        setItemUnitOptions(
          (response.data as any[]).map((t: any) => ({ value: t.code, label: t.name }))
        );
      } catch (err) {
        setItemUnitOptions([]);
      }
    };
    fetchItemTypes();
  }, []);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 0,
    size: 10,
    itemCode: '',
    itemName: '',
    isActive: true,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: searchParams.page,
        size: searchParams.size,
        itemCode: searchParams.itemCode || undefined,
        itemName: searchParams.itemName || undefined,
        isActive: searchParams.isActive !== null ? searchParams.isActive : undefined
      };
      // console.log("params:", params);
      const response = await axios.get<PageResponse<Item>>('/api/master/products', {
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });
      const responseData = response.data;
      setData(responseData.content);
      setPagination(prev => ({
        ...prev,
        total: responseData.totalElements,
        current: responseData.pageable.pageNumber + 1,
        pageSize: responseData.pageable.pageSize,
      }));
    } catch (error) {
      message.error('제품 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [searchParams.page, searchParams.size]);

  const columns: ColumnsType<Item> = [
    {
      title: '제품유형',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (value: string) => {
        const found = itemTypeOptions.find(opt => opt.value === value);
        return found ? found.label : value;
      }
    },
    {
      title: '제품코드',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: '제품명',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '규격',
      dataIndex: 'spec',
      key: 'spec',
    },
    {
      title: '단위',
      dataIndex: 'unit',
      key: 'unit',
      render: (value: string) => {
        const found = itemUnitOptions.find(opt => opt.value === value);
        return found ? found.label : value;
      }
    },
    {
      title: '재고수량',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
    },
    {
      title: '사용여부',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: boolean) => (value ? '활성화' : '비활성화'),
    },
    {
      title: '관리',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => setEditingItem(record)}>
          수정
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setSearchParams(prev => ({
      ...prev,
      page: pagination.current - 1,
      size: pagination.pageSize,
    }));
  };

  const handleSave = async (values: ItemRequest) => {
    try {
      setIsSubmitting(true);
      if (editingItem) {
        // 수정
        await axios.put(`/api/master/items/${editingItem.id}`, values, {
          headers: { 'Content-Type': 'application/json' },
        });
        message.success('제품 정보가 수정되었습니다.');
      } else {
        // 등록
        await axios.post('/api/master/items', values, {
          headers: { 'Content-Type': 'application/json' },
        });
        message.success('제품이 등록되었습니다.');
      }
      setIsModalVisible(false);
      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      message.error('저장 중 오류가 발생했습니다.');
      console.error('저장 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>제품 관리</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setIsModalVisible(true); setEditingItem(null); }}
        >
          제품 등록
        </Button>
      </div>
      <ItemForm
        visible={isModalVisible || editingItem !== null}
        onCancel={() => { setIsModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        loading={isSubmitting}
        initialValues={editingItem || undefined}
        itemTypeOptions={itemTypeOptions}
        itemUnitOptions={itemUnitOptions}
      />
      <SearchBar
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        fetchItems={fetchItems}
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
};

export default ItemManagement;
