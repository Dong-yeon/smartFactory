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

// Response
interface Process {
    id: number;
    processCode: string;
    processName: string;
    processType: string;
    processOrder: number;
    isActive: boolean;
}

// Request
interface ProcessRequest {
    processCode: string;
    processName: string;
    processType: ProcessType;
    processOrder: number;
    isActive: boolean;
}

// Search
interface SearchParams {
    page: number;
    size: number;
    processCode: string;
    processName: string;
    isActive: boolean | null;
}

function convertToTreeData(processList) {
    return processList.map((process) => ({
        title: process.processName,
        key: process.id,
        value: process.id,
        children: Array.isArray(process.children) && process.children.length > 0 ? convertToTreeData(process.children) : [],
        disabled: !process.isActive
    }));
}

function getParentOptions(treeData, excludeId) {
    return treeData.map(node => ({
        ...node,
        disabled: node.key === excludeId,
        children: node.children ? getParentOptions(node.children, excludeId) : [],
    }));
}

// 고정 등록/수정 폼 컴포넌트
const ProcessForm: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSave: (values: any) => void;
    loading: boolean;
    initialValues?: any;
    processTypeOptions: { value: string; label: string }[];
    parentOptions: any[]; // 트리구조 공정 목록
}> = ({
          visible, onCancel, onSave, loading, initialValues, processTypeOptions, parentOptions
      }) => {
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
            title={initialValues ? '공정 수정' : '공정 등록'}
            open={visible}
            onOk={() => form.submit()}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="저장"
            cancelText="취소"
        >
            <Form form={form} onFinish={onSave} initialValues={initialValues || {isActive: true}} layout="vertical">
                <Form.Item name="processCode" label="공정코드" rules={[{required: true, message: '공정코드을 입력해주세요'}]}>
                    <Input placeholder="공정코드을 입력해주세요"/>
                </Form.Item>
                <Form.Item name="processName" label="공정명" rules={[{required: true, message: '공정명을 입력하세요'}]}>
                    <Input placeholder="공정명을 입력해주세요"/>
                </Form.Item>
                <Form.Item name="processType" label="공정유형" rules={[{required: true, message: '공정유형을 선택하세요'}]}>
                    <Select placeholder="공정유형을 선택해주세요">
                        {processTypeOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="processOrder" label="공정순서" rules={[{required: true, message: '공정순서를 입력하세요'}]}>
                    <InputNumber placeholder="공정순서" min={1}/>
                </Form.Item>
                <Form.Item name="parentId" label="상위 공정">
                    <TreeSelect
                        treeData={parentOptions}
                        placeholder="상위 공정 선택(없으면 최상위)"
                        allowClear
                        treeDefaultExpandAll
                        fieldNames={{ title: 'title', value: 'value', children: 'children' }} // value: 'value'로!
                    />
                </Form.Item>
                <Form.Item name="isActive" label="사용여부" valuePropName="checked">
                    <Switch checkedChildren="활성" unCheckedChildren="비활성"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

// SearchBar
const SearchBar: React.FC<{
    searchParams: SearchParams;
    setSearchParams: (params: SearchParams) => void;
    fetchDatas: () => void;
}> = ({ searchParams, setSearchParams, fetchDatas }) => {
    const [localParams, setLocalParams] = useState<SearchParams>(searchParams);

    useEffect(() => {
        fetchDatas();
        // setLocalParams(searchParams);
    }, [searchParams]);

    const handleSearch = () => {
        setSearchParams({...localParams, page: 0});
        fetchDatas();
    };

    const handleReset = () => {
        const resetParams = {page: 0, size: 10, processCode: '', processName: '', isActive: true};
        setLocalParams(resetParams);
        setSearchParams(resetParams);
        fetchDatas();
    };

    const handleInputChange = (field: keyof SearchParams) => (e: any) => {
        let value;
        if (field === 'isActive') {
            value = e === '' ? null : e === 'true';
        } else {
            if (e && e.target) {
                value = e.target.value;
            } else {
                value = e === '';
            }
        }
        setLocalParams(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div style={{marginBottom: 16}}>
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
                    placeholder="공정코드 검색"
                    value={localParams.processCode}
                    onChange={handleInputChange('processCode')}
                    onSearch={handleSearch}
                    enterButton
                    allowClear
                    style={{minWidth: 160, flex: '0 0 300px'}}
                />
                <Search
                    placeholder="공정명 검색"
                    value={localParams.processName}
                    onChange={handleInputChange('processName')}
                    onSearch={handleSearch}
                    enterButton
                    allowClear
                    style={{minWidth: 160, flex: '0 0 300px'}}
                />
                <Select
                    placeholder="활성/비활성 전체"
                    style={{minWidth: 120, flex: '0 0 120px'}}
                    value={localParams.isActive === null ? '' : String(localParams.isActive)}
                    onChange={value => {
                        handleInputChange('isActive')(value); // 상태 업데이트
                    }}
                >
                    <Select.Option value="">전체</Select.Option>
                    <Select.Option value="true">활성</Select.Option>
                    <Select.Option value="false">비활성</Select.Option>
                </Select>
                <Button type="primary" onClick={handleSearch} style={{marginRight: 4}}>
                    검색
                </Button>
                <Button onClick={handleReset}>
                    초기화
                </Button>
            </div>
        </div>
    );
};

// ProcessManagement
const ProcessManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<Item[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<Item | null>(null);
    const [editing, setEditing] = useState<Item | null>(null);
    const [processTypeOptions, setProcessTypeOptions] = useState<{ value: string; label: string }[]>([]);

    const fetchProcessTree = async () => {
        try {
            const response = await axios.get('/api/master/process/tree');
            setTreeData(convertToTreeData(response.data));
            console.log('treeData: ', treeData);
        } catch (err) {
            setTreeData([]);
        }
    };

    const fetchProcessTypes = async () => {
        try {
            const response = await axios.get('/api/master/process/types');
            setProcessTypeOptions(
                (response.data as any[]).map((t: any) => ({ value: t.code, label: t.name }))
            );
        } catch (err) {
            setProcessTypeOptions([]);
        }
    };

    const [searchParams, setSearchParams] = useState<SearchParams>({
        page: 0,
        size: 10,
        processCode: '',
        processName: '',
        isActive: true,
    });

    const fetchDatas = async () => {
        setLoading(true);
        try {
            const params = {
                page: searchParams.page,
                size: searchParams.size,
                processCode: searchParams.processCode || undefined,
                processName: searchParams.processName || undefined,
                isActive: searchParams.isActive !== null ? searchParams.isActive : undefined
            };
            const response = await axios.get<PageResponse<Item>>('/api/master/process', {
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
            message.error('공정 데이터를 불러오는 중 오류가 발생했습니다.');
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcessTree();
    }, []);

    useEffect(() => {
        const fetchProcessTypes = async () => {
            try {
                const response = await axios.get('/api/master/process/types');
                setProcessTypeOptions(
                    (response.data as any[]).map((t: any) => ({ value: t.code, label: t.name }))
                );
            } catch (err) {
                setProcessTypeOptions([]);
            }
        };
        fetchProcessTypes();
    }, []);

    useEffect(() => {
        fetchDatas();
    },  [searchParams.page, searchParams.size]);

    const columns: ColumnsType<Item> = [
        {
            title: '공정코드',
            dataIndex: 'processCode',
            key: 'processCode',
        },
        {
            title: '공정명',
            dataIndex: 'processName',
            key: 'processName',
        },
        {
            title: '공정유형',
            dataIndex: 'processType',
            key: 'processType',
            render: (value: string) => {
                const processType = processTypeOptions.find(item => item.value === value);
                return processType ? processType.label : 'Unknown';
            },
        },
        {
            title: '공정순서',
            dataIndex: 'processOrder',
            key: 'processOrder',
        },
        {
            title: '사용여부',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (value: boolean) => (value ? '활성' : '비활성'),
        },
        {
            title: '관리',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => setEditing(record)}>
                    수정
                </Button>
            ),
        }
    ];

    const handleTableChange = (pagination: any) => {
        setSearchParams(prev => ({
            ...prev,
            page: pagination.current - 1,
            size: pagination.pageSize,
        }));
    };

    const handleSave = async (values: ProcessRequest) => {
        try {
            setIsSubmitting(true);
            if (editing) {
                await axios.put(`/api/master/process/${editing.id}`, values, {
                    headers: { 'Content-Type': 'application/json' },
                });
                message.success('공정이 수정되었습니다.');
            } else {
                await axios.post('/api/master/process', values, {
                    headers: { 'Content-Type': 'application/json' },
                });
                message.success('공정이 등록되었습니다.');
            }
            setIsModalVisible(false);
            setEditing(null);
            fetchDatas();
        } catch (e) {
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={24}>
                <Col span={6}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Title level={5} style={{ margin: 0 }}>공정 트리</Title>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => { setIsModalVisible(true); setEditing(null); }}
                        >
                            공정 등록
                        </Button>
                    </div>
{/*                    <SearchBar
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                        fetchDatas={fetchDatas}
                    />*/}
                    <Tree
                        treeData={treeData}
                        onSelect={(keys, info) => {
                            const selected = data.find(proc => proc.id === info.node.key);
                            setEditing(selected);
                            setIsModalVisible(true);
                        }}
                        defaultExpandAll
                        style={{ background: '#fff', padding: 12, borderRadius: 4 }}
                    />
                </Col>
                <Col span={18}>
                    <ProcessForm
                        visible={isModalVisible}
                        onCancel={() => { setIsModalVisible(false); setEditing(null); }}
                        onSave={handleSave}
                        loading={isSubmitting}
                        initialValues={editing || undefined}
                        processTypeOptions={processTypeOptions}
                        parentOptions={editing ? getParentOptions(treeData, editing.id) : treeData}
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
                </Col>
            </Row>
        </div>
    );
};

export default ProcessManagement;
