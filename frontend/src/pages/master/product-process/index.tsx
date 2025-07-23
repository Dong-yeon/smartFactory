import React, {useState, useEffect, useCallback} from 'react';
import {
    Table,
    message,
    Typography,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    InputNumber,
    Row,
    Col,
    Tree,
    TreeSelect
} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const {Title} = Typography;
const {Option} = Select;

// Response
interface PageResponse<T> {
    content: T[];
    totalElements: number;
    pageable: { pageNumber: number; pageSize: number };
}

interface SearchParams {
    page: number;
    size: number;
    itemCode: string;
    itemName: string;
    isActive: boolean | null;
}

// 제품 타입 명확화
interface Product {
    id: number;
    itemCode: string;
    itemName: string;
    isActive: boolean;
}

// ProcessManagement
const ProcessManagement = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchParams, setSearchParams] = useState<SearchParams>({
        page: 0,
        size: 10,
        itemCode: '',
        itemName: '',
        isActive: true,
    });
    const params = {
        page: searchParams.page,
        size: searchParams.size,
        itemCode: searchParams.itemCode || undefined,
        itemName: searchParams.itemName || undefined,
        isActive: searchParams.isActive !== null ? searchParams.isActive : undefined
    };
    const [data, setData] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [treeData, setTreeData] = useState([]);
    const [processMasterList, setProcessMasterList] = useState<any[]>([]);
    const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
    const [inlineRowData, setInlineRowData] = useState<any>({});

    const fetchDatas = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/master/products', {
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
        fetchDatas();
    },  [searchParams.page, searchParams.size]);

    useEffect(() => {
        axios.get('/api/master/process/all').then(res => {
            console.log("res:", res);
            setProcessMasterList(res.data || []);
        });
    }, []);

    const handleTableChange = (pagination: any) => {
        setSearchParams(prev => ({
            ...prev,
            page: pagination.current - 1,
            size: pagination.pageSize,
        }));
    };

    // 제품 행 클릭 시 처리 함수
    const handleProductRowClick = (record: Product) => {
        // console.log("record:", record);
        setSelectedProduct(record);
        fetchProcessListByProduct(record.id); // 제품별 공정 리스트 조회
    };

    // 제품별 공정 리스트 조회 함수
    const fetchProcessListByProduct = async (itemId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/master/product-process/tree/${itemId}`);
            console.log("response:", response);
            setTreeData(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.totalElements || 0,
                current: 1,
                pageSize: 10,
            }));
        } catch (err) {
            setTreeData([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    // 트리 데이터 변환 함수
    function convertToTreeData(processList: any[]): any[] {
        // console.log("processList:", processList);
        return processList.map((process) => ({
            ...process,
            key: process.id,
            title: process.processName,
            children: Array.isArray(process.children) && process.children.length > 0 ? convertToTreeData(process.children) : [],
        }));
    }

    // 공정 추가 버튼 클릭
    const handleAddProcess = () => {
        handleAddProcessInline();
    };

    // 세부공정 추가 버튼 클릭
    const handleAddSubProcess = (parent: any) => {
        handleAddProcessInline(parent.id);
    };

    // 인라인 행 추가
    const handleAddProcessInline = (parentId?: number) => {
        const newRowKey = `new_${Date.now()}`;
        const newRow = {
            key: newRowKey,
            id: newRowKey,
            processCode: '',
            processName: '',
            parentId: parentId || null,
            children: [],
            isNew: true,
            processOrder: parentId ? (findNodeById(treeData, parentId)?.children?.length || 0) + 1 : treeData.length + 1
        };
        // 트리 데이터에 임시 행 추가
        if (parentId) {
            // 세부공정 추가
            setTreeData(prev => addChildToTree(prev, parentId, newRow));
        } else {
            setTreeData(prev => [...prev, newRow]);
        }
        setEditingRowKey(newRowKey);
        setInlineRowData(newRow);
    };

    function addChildToTree(tree, parentId, child) {
        return tree.map(node => {
            if (node.id === parentId) {
                return { ...node, children: [...(node.children || []), child] }; // 맨 뒤에 추가
            } else if (node.children && node.children.length > 0) {
                return { ...node, children: addChildToTree(node.children, parentId, child) };
            }
            return node;
        });
    }

    // 공정코드 선택 시 상세정보 자동 채우기
    const handleProcessCodeSelect = (code: string) => {
        const selected = processMasterList.find((p) => p.processCode === code);
        setInlineRowData(prev => ({
            ...prev,
            processCode: code,
            processName: selected?.processName || '',
            processTime: 0
        }));
    };

    // 인라인 저장
    const handleInlineSave = async () => {
        try {
            setLoading(true);
            const payload = {
                ...inlineRowData,
                parentId: inlineRowData.parentId,
                children: inlineRowData.children,
                processOrder: inlineRowData.processOrder,
                processCode: inlineRowData.processCode,
                processName: inlineRowData.processName,
                processTime: inlineRowData.processTime,
                itemId: selectedProduct?.id,
                productPorcessId: inlineRowData.id
            };
            // console.log("payload:", payload);
            if (inlineRowData.id && !String(inlineRowData.id).startsWith('new_')) {
                // update
                await axios.put('/api/master/product-process', payload);
            } else {
                // create
                await axios.post('/api/master/product-process', payload);
            }
            setEditingRowKey(null);
            setInlineRowData({});
            fetchProcessListByProduct(selectedProduct?.id!);
            message.success('공정이 저장되었습니다.');
        } catch (e) {
            message.error('공정 저장 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    // 인라인 취소
    const handleInlineCancel = () => {
        setEditingRowKey(null);
        setInlineRowData({});
        fetchProcessListByProduct(selectedProduct?.id!);
    };

    // 제품 리스트 테이블 컬럼
    const productColumns = [
        {
            title: '제품코드',
            dataIndex: 'itemCode',
            key: 'itemCode',
            width: 80,
            align: 'center',
        },
        {
            title: '제품명',
            dataIndex: 'itemName',
            key: 'itemName',
            width: 120,
            align: 'center',
        },
    ];

    // 공정 리스트 트리 테이블 컬럼
    const processColumns = [
        {
            title: <span style={{ display: 'block', textAlign: 'center' }}>순서</span>,
            dataIndex: 'processOrder',
            key: 'processOrder',
            width: 150,
            align: 'center',
            // render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: <span style={{ display: 'block', textAlign: 'center' }}>공정코드</span>,
            dataIndex: 'processCode',
            key: 'processCode',
            align: 'center',
            render: (value: any, record: any) =>
                record.key === editingRowKey ? (
                    <Select
                        showSearch
                        style={{ minWidth: 120 }}
                        value={inlineRowData.processCode}
                        onChange={handleProcessCodeSelect}
                        placeholder="공정코드 선택"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {processMasterList.map((p) => (
                            <Option key={p.processCode} value={p.processCode}>{p.processCode}</Option>
                        ))}
                    </Select>
                ) : (
                    <span onClick={() => {
                        setEditingRowKey(record.key);
                        setInlineRowData(record);
                    }} style={{ cursor: 'pointer', color: '#1677ff', textDecoration: 'underline' }}>{value}</span>
                ),
        },
        {
            title: <span style={{ display: 'block', textAlign: 'center' }}>공정명</span>,
            dataIndex: 'processName',
            key: 'processName',
            align: 'center',
            render: (value: any, record: any) =>
                record.key === editingRowKey ? (
                    <Input
                        value={inlineRowData.processName}
                        disabled
                        placeholder="공정명"
                    />
                ) : (
                    value
                ),
        },
        {
            title: '시간',
            dataIndex: 'processTime',
            key: 'processTime',
            align: 'center',
            render: (value: any, record: any) =>
                record.key === editingRowKey ? (
                    <InputNumber
                        value={inlineRowData.processTime}
                        min={0}
                        step={1}
                        onChange={val => setInlineRowData(prev => ({ ...prev, processTime: val }))}
                        placeholder="시간"
                    />
                ) : (
                    value
                ),
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            render: (_: any, record: any) =>
                record.key === editingRowKey ? (
                    <>
                        <Button type="link" onClick={handleInlineSave} loading={loading}>저장</Button>
                        <Button type="link" onClick={handleInlineCancel}>취소</Button>
                    </>
                ) : (
                    <Button type="link" size="small" onClick={() => handleAddProcessInline(record.id)}>세부공정 추가</Button>
                ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={24}>
                {/* 좌측: 제품 리스트 */}
                <Col span={6}>
                    <div>
                        <Title level={5} style={{ margin: 0 }}>제품 리스트</Title>
                        <Table
                            columns={productColumns}
                            dataSource={data}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            bordered
                            rowClassName={(record) => record.id === selectedProduct?.id ? 'selected-row' : ''}
                            onRow={(record) => ({
                                onClick: () => handleProductRowClick(record),
                                style: { cursor: 'pointer' },
                            })}
                            style={{ marginTop: 8, background: '#fff', borderRadius: 4 }}
                        />
                    </div>
                </Col>
                {/* 우측: 공정 트리 + 폼/테이블 */}
                <Col span={18}>
                    <div>
                        <Title level={5} style={{ margin: 0 }}>
                            공정 리스트
                            <Button
                                type="primary"
                                size="small"
                                style={{ marginLeft: 12 }}
                                icon={<PlusOutlined />}
                                onClick={handleAddProcess}
                            >
                                행 추가
                            </Button>
                        </Title>
                        <Table
                            columns={processColumns}
                            dataSource={convertToTreeData(treeData)}
                            rowKey="id"
                            pagination={false}
                            loading={loading}
                            expandable={{
                                childrenColumnName: 'children',
                                defaultExpandAllRows: true,
                            }}
                            bordered
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ProcessManagement;
