import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { Form, Input, Select, Button, Modal, Space, message, Switch, InputNumber } from 'antd';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { getCommonContextMenuItems } from '../../../components/aggrid/getContextMenuItems';

ModuleRegistry.registerModules([ AllCommunityModule ]);

const { Option } = Select;

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
};

const ItemGrid = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemTypeOptions, setItemTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [itemUnitOptions, setItemUnitOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    axios.get('/api/master/items/types')
        .then(res => setItemTypeOptions((res.data as any[]).map((t: any) => ({ value: t.code, label: t.name }))))
        .catch(() => setItemTypeOptions([]));
  }, []);

  useEffect(() => {
    axios.get('/api/master/items/units')
        .then(res => setItemUnitOptions((res.data as any[]).map((t: any) => ({ value: t.code, label: t.name }))))
        .catch(() => setItemUnitOptions([]));
  }, []);

  const fetchItems = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/master/products', { params: { page: 0, size: 1000, ...params } });
      setRowData(res.data.content || []);
    } catch {
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const columnDefs = useMemo(() => [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 40,
      pinned: 'left',
      suppressMenu: true,
      suppressMovable: true,
      filter: false, // 필터 비활성화 추가
    },
    { headerName: 'ID', field: 'id', minWidth: 60, maxWidth: 80 },
    { headerName: '품목코드', field: 'itemCode', minWidth: 100, flex: 1 },
    { headerName: '품목명', field: 'itemName', minWidth: 120, flex: 2 },
    {
      headerName: '품목구분', field: 'itemType', minWidth: 100, flex: 1,
      valueFormatter: (params: any) => {
        const found = itemTypeOptions.find(opt => opt.value === params.value);
        return found ? found.label : params.value;
      }
    },
    { headerName: '규격/모델', field: 'spec', minWidth: 100, flex: 1 },
    { headerName: '단위', field: 'unit', minWidth: 60, maxWidth: 80 },
    { headerName: '안전재고', field: 'safetyStock', minWidth: 80, maxWidth: 100 },
    { headerName: '사용여부', field: 'isActive', minWidth: 80, maxWidth: 100, valueFormatter: p => p.value ? '활성' : '비활성' },
  ], [itemTypeOptions]);

  // 검색 핸들러
  const onSearch = (values: any) => {
    fetchItems(values);
  };

  // 추가 버튼
  const handleAdd = () => {
    setModalMode('add');
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 행 더블클릭 시 수정
  const handleRowDoubleClicked = async (event: any) => {
    setModalMode('edit');
    setEditingItem(event.data);
    setModalVisible(true);
    try {
      const res = await axios.get(`/api/master/items/${event.data.id}`);
      form.setFieldsValue(res.data);
    } catch {
      message.error('상세 정보를 불러오지 못했습니다');
    }
  };

  // 체크박스 선택 변경
  const onSelectionChanged = () => {
    const selectedRows = gridRef.current?.api.getSelectedRows() || [];
    setSelectedIds(selectedRows.map((row: any) => row.id));
  };

  // 일괄 삭제
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    Modal.confirm({
      title: '선택한 자재(품목)를 삭제하시겠습니까?',
      content: `${selectedIds.length}개 항목`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await Promise.all(selectedIds.map(id => axios.delete(`/api/master/items/${id}`)));
          message.success('삭제되었습니다');
          setSelectedIds([]);
          fetchItems();
        } catch {
          message.error('삭제 실패');
        }
      }
    });
  };

  // 추가/수정 저장
  const onModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'add') {
        await axios.post('/api/master/items', values);
        message.success('등록되었습니다');
      } else if (editingItem) {
        await axios.put(`/api/master/items/${editingItem.id}`, values);
        message.success('수정되었습니다');
      }
      setModalVisible(false);
      fetchItems();
    } catch (e) {
      // validation error
    }
  };

  return (
      <div style={{ padding: 24 }}>
        <h4>자재(품목) 관리</h4>
        {/* 검색 폼 및 추가/삭제 버튼 */}
        <Form
            form={searchForm}
            layout="inline"
            onFinish={onSearch}
            style={{ marginBottom: 16 }}
        >
          <Form.Item name="itemCode" label="품목코드">
            <Input placeholder="품목코드" allowClear />
          </Form.Item>
          <Form.Item name="itemName" label="품목명">
            <Input placeholder="품목명" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">검색</Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleAdd}>추가</Button>
          </Form.Item>
          <Form.Item>
            <Button danger disabled={selectedIds.length === 0} onClick={handleBatchDelete}>삭제</Button>
          </Form.Item>
        </Form>

        {/* AG Grid */}
        <div className="ag-theme-alpine" style={{ width: '100%', height: 800 }}>
          <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection={false}
              onRowDoubleClicked={handleRowDoubleClicked}
              onSelectionChanged={onSelectionChanged}
              loadingOverlayComponentParams={{ loadingMessage: '로딩 중...' }}
              overlayLoadingTemplate={loading ? '<span class=\"ag-overlay-loading-center\">로딩 중...</span>' : undefined}
          />
        </div>

        {/* 추가/수정 모달 */}
        <Modal
            title={modalMode === 'add' ? '자재(품목) 추가' : '자재(품목) 수정'}
            open={modalVisible}
            onOk={onModalOk}
            onCancel={() => setModalVisible(false)}
            okText="저장"
            cancelText="취소"
            destroyOnClose
        >
          <Form
              form={form}
              layout="vertical"
              initialValues={{ isActive: true, safetyStock: 0 }}
          >
            <Form.Item name="itemCode" label="품목코드" rules={[{ required: true, message: '품목코드를 입력해주세요' }]}>
              <Input placeholder="품목코드" />
            </Form.Item>
            <Form.Item name="itemName" label="품목명" rules={[{ required: true, message: '품목명을 입력해주세요' }]}>
              <Input placeholder="품목명" />
            </Form.Item>
            <Form.Item name="itemType" label="품목구분" rules={[{ required: true, message: '품품목구분을 선택해주세요' }]}>
              <Select placeholder="품목구분" options={itemTypeOptions} />
            </Form.Item>
            <Form.Item name="spec" label="규격/모델">
              <Input placeholder="규격/모델" />
            </Form.Item>
            <Form.Item name="unit" label="단위">
              <Select options={itemUnitOptions} />
            </Form.Item>
            <Form.Item name="safetyStock" label="안전재고">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="isActive" label="사용여부" valuePropName="checked">
              <Switch checkedChildren="활성" unCheckedChildren="비활성" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default ItemGrid;
