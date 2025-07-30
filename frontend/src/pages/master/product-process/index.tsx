import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, Modal, Space, message, Switch, InputNumber } from 'antd';
import ProductGrid from './ProductGrid.tsx';
import ProductProcessGrid from './ProductProcessGrid.tsx';
const { Option } = Select;

const ProductGridContainer = () => {
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
  const gridViewRef = useRef<any>(null);
  const dataProviderRef = useRef<any>(null);
  const deletedRowIdsRef = useRef<number[]>([]);

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

  // 검색 핸들러
  const onSearch = (values: any) => {
    fetchItems(values);
  };

  const handleAddRow = () => {
    if (gridViewRef.current && dataProviderRef.current) {
      dataProviderRef.current.addRow({
        itemCode: '',
        itemName: '',
        itemType: itemTypeOptions[2]?.value ?? null,
        spec: '',
        unit: itemUnitOptions[0]?.value ?? null,
        safetyStock: 0,
        description: '',
        isActive: true
      });
    }
  };

  const handleRemoveRows = () => {
    if (gridViewRef.current && dataProviderRef.current) {
      const checkedRows = gridViewRef.current.getCheckedRows();
      const dataRows = checkedRows.map(row => gridViewRef.current.getDataRow(row));
      // 삭제할 id 저장
      dataRows.forEach(row => {
        const data = dataProviderRef.current.getJsonRow(row);
        if (data.id) deletedRowIdsRef.current.push(data.id);
      });
      // 실제로 데이터에서 제거
      dataProviderRef.current.removeRows(dataRows);
    }
  };

  const handleSave = async () => {
    if (gridViewRef.current) {
      gridViewRef.current.commit(true);
    }
    if (!dataProviderRef.current) return;

    const createdRows = dataProviderRef.current.getStateRows('created');
    const updatedRows = dataProviderRef.current.getStateRows('updated');

    try {
      for (const row of createdRows) {
        const data = dataProviderRef.current.getJsonRow(row);
        await axios.post('/api/master/items', data);
      }
      for (const row of updatedRows) {
        const data = dataProviderRef.current.getJsonRow(row);
        await axios.put(`/api/master/items/${data.id}`, data);
      }
      for (const id of deletedRowIdsRef.current) {
        await axios.delete(`/api/master/items/${id}`);
      }
      deletedRowIdsRef.current = []; // 저장 후 초기화
      message.success('저장되었습니다');
      fetchItems();
      dataProviderRef.current.clearRowStates();
    } catch (e) {
      message.error('저장 실패');
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '85vh', boxSizing: 'border-box' }}>
      <h4>제품 리스트</h4>
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
      </Form>

      {/* RealGrid */}
      <div style={{ display: 'flex', height: '85vh', gap: 16 }}>
        {/* 왼쪽: 단일 그리드 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ProductGrid
                rowData={rowData}
                itemTypeOptions={itemTypeOptions}
                itemUnitOptions={itemUnitOptions}
                onSelectIds={setSelectedIds}
                gridViewRef={gridViewRef}
                dataProviderRef={dataProviderRef}
            />
          </div>
        </div>
        {/* 오른쪽: 상하 2개 그리드 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ProductProcessGrid
                  rowData={rowData}
                  itemTypeOptions={itemTypeOptions}
                  itemUnitOptions={itemUnitOptions}
                  onSelectIds={setSelectedIds}
                  gridViewRef={gridViewRef}
                  dataProviderRef={dataProviderRef}
              />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ProductGrid
                  rowData={rowData}
                  itemTypeOptions={itemTypeOptions}
                  itemUnitOptions={itemUnitOptions}
                  onSelectIds={setSelectedIds}
                  gridViewRef={gridViewRef}
                  dataProviderRef={dataProviderRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridContainer;
