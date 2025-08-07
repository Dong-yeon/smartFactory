import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, Modal, Space, message, Switch, InputNumber } from 'antd';
import ProductGrid from './ProductGrid.tsx';
import ProductProcessGrid from './ProductProcessGrid.tsx';
import ProductProcessRevisionGrid from './ProductProcessRevisionGrid.tsx';
const { Option } = Select;

const ProductGridContainer = () => {
  const [searchForm] = Form.useForm();
  const [productRowData, setProductRowData] = useState([]);
  const [productProcessRowData, setProductProcessRowData] = useState([]);
  const [productProcessRevisionRowData, setProductProcessRevisionRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemTypeOptions, setItemTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [itemUnitOptions, setItemUnitOptions] = useState<{ value: string; label: string }[]>([]);
  const [processOptions, setProcessOptions] = useState<{ value: string; label: string }[]>([]);

  const [selectedItemCode, setSelectedItemCode] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedRevisionNo, setSelectedRevisionNo] = useState<string | null>(null);

  // 각 그리드별 Ref 선언
  const productGridViewRef = useRef<any>(null);
  const productDataProviderRef = useRef<any>(null);
  const productProcessGridViewRef = useRef<any>(null);
  const productProcessDataProviderRef = useRef<any>(null);
  const productProcessRevisionGridViewRef = useRef<any>(null);
  const productProcessRevisionDataProviderRef = useRef<any>(null);

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

  useEffect(() => {
    axios.get('/api/master/process/all')
      .then(res => {
        setProcessOptions((res.data as any[]).map((t: any) => ({ value: t.processCode, label: t.processName })));
      })
      .catch(() => setProcessOptions([]));
  }, []);

  const fetchItems = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/master/products', { params: { page: 0, size: 1000, ...params } });
      setProductRowData(res.data.content || []);
    } catch {
      setProductRowData([]);
    } finally {
      setLoading(false);
    }
  };

const handleProductSelect = (selectedIds: number[]) => {
  if (selectedIds.length > 0) {
    fetchProductProcess({ itemId: selectedIds[0] });
    fetchProductProcessRevision({ itemId: selectedIds[0] });
  } else {
    setProductProcessRowData([]);
    setProductProcessRevisionRowData([]);
  }
};

const fetchProductProcess = async (params = {}) => {
  setLoading(true);
  try {
    const res = await axios.get('/api/master/product-process', { params: { ...params } });
    setProductProcessRowData(res.data || []);
  } catch {
    setProductProcessRowData([]);
  } finally {
    setLoading(false);
  }
};

const fetchProductProcessRevision = async (params = {}) => {
  setLoading(true);
  try {
    const res = await axios.get('/api/master/product-process-revisions', { params: { ...params } });
    setProductProcessRevisionRowData(res.data || []);
  } catch {
    setProductProcessRevisionRowData([]);
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
    // fetchProductProcess(values);
    // fetchProductProcessRevision(values);
  };

  const handleAddProcessRow = () => {
    console.log(selectedItemCode);
    if (!selectedItemCode) return;
    if (productProcessGridViewRef.current && productProcessDataProviderRef.current) {
      productProcessGridViewRef.current.commit(true);
      const rows = productProcessDataProviderRef.current.getJsonRows();
      const maxOrder = rows.length > 0 ? Math.max(...rows.map((r: any) => r.processOrder || 0)) : 0;
      productProcessDataProviderRef.current.addRow({
        processId: '',
        processCode: '',
        processName: '',
        processOrder: maxOrder + 10,
        processTime: 0,
        isActive: true
      });
    }
  };

  const handleInsertProcessRow = () => {
    if (productProcessGridViewRef.current && productProcessDataProviderRef.current) {
      productProcessGridViewRef.current.commit(true);
      const currentRow = productProcessGridViewRef.current.getCurrent().dataRow;
      const rows = productProcessDataProviderRef.current.getJsonRows();
  
      let prevOrder = 0, nextOrder = 0;
      if (currentRow === -1) {
        prevOrder = rows.length > 0 ? Math.max(...rows.map(r => r.processOrder || 0)) : 0;
        nextOrder = prevOrder + 20;
      } else {
        prevOrder = rows[currentRow]?.processOrder || 0;
        nextOrder = rows[currentRow + 1]?.processOrder || (prevOrder + 20);
      }
      let newOrder = Math.floor((prevOrder + nextOrder) / 2);
  
      // 만약 newOrder가 prevOrder와 같으면 전체 리시퀀싱 필요
      if (newOrder === prevOrder) {
        // 전체 processOrder를 10 간격으로 재정렬
        rows.forEach((row, idx) => {
          productProcessDataProviderRef.current.setValue(idx, 'processOrder', (idx + 1) * 10);
        });
        prevOrder = (currentRow + 1) * 10;
        nextOrder = prevOrder + 10;
        newOrder = Math.floor((prevOrder + nextOrder) / 2);
      }
  
      productProcessDataProviderRef.current.insertRow(currentRow + 1, {
        processId: '',
        processCode: '',
        processName: '',
        processOrder: newOrder,
        processTime: 0,
        isActive: true
      });
    }
  };

  const handleRemoveProcessRows = () => {
    if (productProcessGridViewRef.current && productProcessDataProviderRef.current) {
      productProcessGridViewRef.current.commit(true);
      const checkedRows = productProcessGridViewRef.current.getCheckedRows();
      const dataRows = checkedRows.map(row => productProcessGridViewRef.current.getDataRow(row));
      productProcessDataProviderRef.current.removeRows(dataRows);
    }
  };

  const handleProcessSave = async () => {
    if (productProcessGridViewRef.current) {
      productProcessGridViewRef.current.commit(true);
    }
    if (!productProcessDataProviderRef.current) return;

    const rows = productProcessDataProviderRef.current.getJsonRows();

    try {
      await axios.post('/api/master/product-process', rows);
      message.success('저장되었습니다');
      fetchProductProcess();
      productProcessDataProviderRef.current.clearRowStates();
    } catch (e) {
      message.error('저장 실패');
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '85vh', boxSizing: 'border-box' }}>
      <h4>제품 리스트</h4>
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

      <div style={{ display: 'flex', height: '85vh', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ProductGrid
                  rowData={productRowData}
                  onSelectItem={(itemCode, item) => {
                    setSelectedItemCode(itemCode);
                    setSelectedItem(item);
                    setProductProcessRevisionRowData([]);
                    setProductProcessRowData([]);
                    setSelectedRevisionNo(null);
                  }}
                  itemTypeOptions={itemTypeOptions}
                  itemUnitOptions={itemUnitOptions}
                  gridViewRef={productGridViewRef}
                  dataProviderRef={productDataProviderRef}
                  containerId="realgrid-product-grid-left"
              />
          </div>
        </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ flex: 7, minHeight: 50, height: '70%' }}>
              <div style={{ flex: 1, minHeight: 50, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flex: 'none', height: 'auto' }}>
                  <Button type="primary" onClick={handleAddProcessRow}>행 추가</Button>
                  <Button type="primary" onClick={handleInsertProcessRow}>행 삽입</Button>
                  <Button danger onClick={handleRemoveProcessRows}>행 삭제</Button>
                  <Button onClick={handleProcessSave}>저장</Button>
                </div>
                <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
                  <ProductProcessGrid
                    rowData={productProcessRowData}
                    processOptions={processOptions}
                    gridViewRef={productProcessGridViewRef}
                    dataProviderRef={productProcessDataProviderRef}
                    containerId="realgrid-product-process-grid-top-right"
                  />
                </div>
              </div>
              </div>
              <div style={{ flex: 3, minHeight: 50, height: '30%' }}>
                  <div style={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <ProductProcessRevisionGrid
                          rowData={productProcessRevisionRowData}
                          gridViewRef={productProcessRevisionGridViewRef}
                          dataProviderRef={productProcessRevisionDataProviderRef}
                          containerId="realgrid-product-process-revision-grid-bottom-right"
                      />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGridContainer;
