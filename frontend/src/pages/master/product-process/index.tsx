import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { Row, Col, Card, Typography, Form, Input, Button } from 'antd';
import { getCommonContextMenuItems } from '../../../components/aggrid/getContextMenuItems';

const { Title } = Typography;

const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
};

// 트리 데이터 변환: 각 노드에 path 배열 포함
function buildProcessTreeWithPath(processes, parentPath = []) {
    return processes.map(proc => {
        const path = [...parentPath, proc.processName];
        return {
            ...proc,
            path,
            children: proc.children ? buildProcessTreeWithPath(proc.children, path) : [],
        };
    });
}

// 트리 데이터 플랫하게 변환 (AG Grid treeData expects flat array)
function flattenProcessTree(tree) {
    let flat = [];
    tree.forEach(node => {
        const { children, ...rest } = node;
        flat.push(rest);
        if (children && children.length > 0) {
            flat = flat.concat(flattenProcessTree(children));
        }
    });
    return flat;
}

const ProductProcessPage = () => {
    // 제품(품목) 목록
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [processTreeData, setProcessTreeData] = useState([]); // 플랫 트리 데이터
    const gridRef = useRef(null);
    const [searchForm] = Form.useForm();

    // 제품 목록 불러오기
    const fetchProducts = async (params = {}) => {
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

    // 특정 제품의 공정 트리 불러오기 (트리 구조 -> 플랫 배열, path 포함)
    const fetchProcessTree = async (productId) => {
        setProcessTreeData([]);
        if (!productId) return;
        try {
            const res = await axios.get(`/api/master/product-process/tree/${productId}`);
            const tree = buildProcessTreeWithPath(res.data || []);
            setProcessTreeData(flattenProcessTree(tree));
        } catch {
            setProcessTreeData([]);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 제품 그리드 컬럼 정의
    const columnDefs = useMemo(() => [
        { headerName: '품목코드', field: 'itemCode', minWidth: 100, flex: 1 },
        { headerName: '품목명', field: 'itemName', minWidth: 120, flex: 2 },
        { headerName: '사용여부', field: 'isActive', minWidth: 80, maxWidth: 100, valueFormatter: p => p.value ? '활성' : '비활성' },
    ], []);

    // 공정 트리 AG Grid 컬럼 정의
    const processColumnDefs = useMemo(() => [
        {
            headerName: '공정명',
            field: 'processName',
            cellRenderer: 'agGroupCellRenderer',
            minWidth: 180,
            flex: 2,
        },
        { headerName: '공정코드', field: 'processCode', minWidth: 100, flex: 1 },
        { headerName: '공정유형', field: 'processType', minWidth: 100, flex: 1 },
        { headerName: '공정순서', field: 'processOrder', minWidth: 80, flex: 1 },
        { headerName: '사용여부', field: 'isActive', minWidth: 80, flex: 1, valueFormatter: p => p.value ? '활성' : '비활성' },
    ], []);

    // 제품 선택 시 공정 트리 로드
    const handleProductRowClick = (event) => {
        setSelectedProduct(event.data);
        fetchProcessTree(event.data.id);
    };

    // 검색 핸들러
    const onSearch = (values) => {
        fetchProducts(values);
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={4}>제품별 공정 관리</Title>
            <Row gutter={16}>
                {/* 왼쪽: 제품 그리드 */}
                <Col span={10}>
                    <Card title="제품 목록" bodyStyle={{ padding: 12 }}>
                        <Form form={searchForm} layout="inline" onFinish={onSearch} style={{ marginBottom: 12 }}>
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
                        <div className="ag-theme-alpine" style={{ width: '100%', height: 600 }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowSelection="single"
                                suppressRowClickSelection={false}
                                onRowClicked={handleProductRowClick}
                                loadingOverlayComponentParams={{ loadingMessage: '로딩 중...' }}
                                overlayLoadingTemplate={loading ? '<span class=\"ag-overlay-loading-center\">로딩 중...</span>' : undefined}
                            />
                        </div>
                    </Card>
                </Col>
                {/* 오른쪽: 공정 트리 AG Grid */}
                <Col span={14}>
                    <Card title={selectedProduct ? `공정 트리: ${selectedProduct.itemName}` : '공정 트리'} bodyStyle={{ padding: 12, minHeight: 600 }}>
                        {selectedProduct ? (
                            <div className="ag-theme-alpine" style={{ width: '100%', height: 600 }}>
                                <AgGridReact
                                    rowData={processTreeData}
                                    columnDefs={processColumnDefs}
                                    defaultColDef={defaultColDef}
                                    treeData={true}
                                    getDataPath={data => data.path}
                                    groupDefaultExpanded={-1}
                                    animateRows={true}
                                    suppressRowClickSelection={true}
                                    getContextMenuItems={getCommonContextMenuItems}
                                />
                            </div>
                        ) : (
                            <div style={{ color: '#888', padding: 24 }}>제품을 선택하면 공정 트리가 표시됩니다.</div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductProcessPage;
