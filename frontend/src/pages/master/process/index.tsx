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
    Tree
} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import axios from 'axios';

const {Title} = Typography;
const {Option} = Select;

const ProcessForm : React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSave: (values: any) => void;
    loading: boolean;
    initialValues?: any;
    processTypeOptions: { value: string; label: string }[];
}> = ({visible, onCancel, onSave, loading, initialValues, processTypeOptions}) => {
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
                <Form.Item name="isActive" label="사용여부" valuePropName="checked">
                    <Switch checkedChildren="활성" unCheckedChildren="비활성"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

interface ProcessRequest {
    processCode: string;
    processName: string;
    processType: ProcessType;
    processOrder: number;
    isActive: boolean;
}

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
    const [editing, setEditing] = useState<Item | null>(null);
    const [processTypeOptions, setProcessTypeOptions] = useState<{ value: string; label: string }[]>([]);

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

    const [searchParams, setSearchParams] = useState<SearchParams>({
        page: 0,
        size: 10,
        isActive: true,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: searchParams.page,
                size: searchParams.size,
                isActive: searchParams.isActive !== null ? searchParams.isActive : undefined
            };
            const response = await axios.get<PageResponse<Item>>('/api/master/items', {
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
            message.error('자재 데이터를 불러오는 중 오류가 발생했습니다.');
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    },  [searchParams.page, searchParams.size]);

    const handleSelect = (keys) => {
        const found = data.find(proc => proc.id === keys[0]);
        setSelected(found || null);
    };

    const handleSave = async (values: ProcessRequest) => {
        console.log("values", values);
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
            fetchData();
        } catch (e) {
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{padding: 24}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>공정 관리</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setIsModalVisible(true); setEditingItem(null); }}
                >
                    공정 등록
                </Button>
            </div>
            <ProcessForm
                visible={isModalVisible || editing !== null}
                onCancel={() => { setIsModalVisible(false);setEditing(null); }}
                onSave={handleSave}
                loading={isSubmitting}
                initialValues={editing || undefined}
                processTypeOptions={processTypeOptions}
            />
        </div>
    );
};

export default ProcessManagement;
