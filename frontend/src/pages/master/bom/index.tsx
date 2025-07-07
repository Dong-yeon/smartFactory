import React, { useState, useEffect } from 'react';
import { Tree, Select, Spin, message, Button, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

// Product(완제품) 타입
interface Product {
  itemCode: string;
  itemName: string;
  itemType: string;
}

// BOM 트리 노드 타입 (Antd Tree 용)
interface BomNode {
  title: React.ReactNode;
  key: string;
  children?: BomNode[];
  data?: BomTreeDto; // 원본 데이터 보관용
}

// 백엔드 BomTreeDto와 맞춘 타입
export interface BomTreeDto {
  id?: number;
  parentItemId: string;
  childItemId: string;
  childName: string;
  quantity: number;
  level?: number;
  path?: string;
  isActive?: boolean;
  children?: BomTreeDto[];
}

// BOM 데이터 타입 (폼용)
interface BomData {
  id?: number;
  childItemId: string;
  childName: string;
  quantity: number;
  parentItemId: string;
}

interface ProductsResponse {
  content: Product[];
}

const BomPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>();
  const [treeData, setTreeData] = useState<BomNode[]>([]);
  const [loading, setLoading] = useState(false);

  // BOM 추가용 자재 리스트 (완제품 제외)
  const [itemOptions, setItemOptions] = useState<Product[]>([]);

  // Modal/폼 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add'|'edit'>('add');
  const [editingNode, setEditingNode] = useState<BomNode|null>(null);
  const [parentNode, setParentNode] = useState<BomNode|null>(null);
  const [form] = Form.useForm<BomData>();

  // 완제품(제품) 리스트 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<ProductsResponse>('/api/master/products', {
          params: {
            page: 0,
            size: 100,
            itemType: 'FINISHED_PRODUCT',
            isActive: true,
          },
        });
        setProducts(Array.isArray(response.data?.content) ? response.data.content : []);
      } catch (error) {
        message.error('완제품 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchProducts();
  }, []);

  // 자재(완제품 제외) 리스트 불러오기 (BOM 추가용)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get<ProductsResponse>('/api/master/items', {
          params: {
            page: 0,
            size: 1000,
            itemType: undefined, // 전체 중에서 필터링
            isActive: true,
          }
        });
        // 완제품 제외
        setItemOptions(Array.isArray(response.data?.content) ? response.data.content.filter(i => i.itemType !== 'FINISHED_PRODUCT') : []);
      } catch (error) {
        setItemOptions([]);
      }
    };
    fetchItems();
  }, []);

  // BOM 트리 불러오기
  useEffect(() => {
    if (!selectedProduct) {
      setTreeData([]);
      return;
    }
    const fetchBom = async () => {
      setLoading(true);
      try {
        console.log("selectedProduct:", selectedProduct);
        const response = await axios.get(`/api/master/bom/${selectedProduct}/active`);
        let apiList = Array.isArray(response.data) ? response.data : [];
        const selected = products.find(p => p.itemCode === selectedProduct);
        let data: any[] = [];
        if (selected) {
          const rootNode = {
            childItemId: selected.itemCode,
            childName: selected.itemName,
            parentItemId: '',
            quantity: 1,
            children: apiList,
          };
          data = [rootNode];
        } else {
          data = apiList;
        }
        // 트리 노드에 data 속성 추가 (수정/삭제용)
        function attachData(nodes: any[]): BomNode[] {
          return nodes.map((node: any) => ({
            ...node,
            data: node,
            children: node.children ? attachData(node.children) : [],
          }));
        }
        setTreeData(attachData(data));
      } catch (error) {
        message.error('BOM 트리를 불러오는 데 실패했습니다.');
        setTreeData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBom();
  }, [selectedProduct, products]);

  return (
    <div style={{ padding: '24px' }}>
      <h2>BOM 관리</h2>
      <Select
        style={{ width: 300 }}
        placeholder="완제품을 선택하세요"
        onChange={setSelectedProduct}
        value={selectedProduct}
        allowClear
        showSearch
        optionFilterProp="children"
      >
        {products.map((item) => (
          <Option key={item.itemCode} value={item.itemCode}>
            {item.itemName} ({item.itemCode})
          </Option>
        ))}
      </Select>
      <div style={{ marginTop: 24 }}>
        {loading ? <Spin /> :
          <Tree
            treeData={treeData.map(node => renderTreeNodeWithActions(node))}
            defaultExpandAll
          />
        }
      </div>

      {/* BOM 추가 버튼 (루트) */}
      {selectedProduct && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          style={{ marginTop: 16 }}
          onClick={() => {
            setModalType('add');
            setParentNode(null);
            setEditingNode(null);
            form.resetFields();
            form.setFieldsValue({ parentItemId: selectedProduct });
            setModalOpen(true);
          }}
        >
          BOM 추가
        </Button>
      )}

      {/* BOM 추가/수정 Modal */}
      <Modal
        title={modalType === 'add' ? 'BOM 추가' : 'BOM 수정'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Form.Item label="자재 코드" name="childItemId" rules={[{ required: true, message: '자재 코드를 선택하세요' }]}
          >
            {modalType === 'add' ? (
              <Select
                showSearch
                placeholder="자재 코드를 선택하세요"
                optionFilterProp="children"
                onChange={(value) => {
                  // 자재명 자동입력
                  const found = itemOptions.find(i => i.itemCode === value);
                  form.setFieldsValue({ childName: found ? found.itemName : '' });
                }}
              >
                {itemOptions.map(item => (
                  <Option key={item.itemCode} value={item.itemCode}>
                    {item.itemCode} ({item.itemName})
                  </Option>
                ))}
              </Select>
            ) : (
              <Input disabled />
            )}
          </Form.Item>
          <Form.Item label="자재명" name="childName" rules={[{ required: true, message: '자재명을 입력하세요' }]}
          >
            <Input readOnly={modalType === 'add'} />
          </Form.Item>
          <Form.Item label="수량" name="quantity" rules={[{ required: true, message: '수량을 입력하세요' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          {/* 부모코드는 숨김필드 */}
          <Form.Item name="parentCode" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // 트리 노드에 액션 버튼 추가
  function renderTreeNodeWithActions(node: BomNode): BomNode {
    return {
      ...node,
      title: (
        <span>
          {node.data ? `${node.data.childName} (${node.data.childItemId})` : node.title}
          <Button size="small" icon={<PlusOutlined />} style={{ marginLeft: 8 }} onClick={e => { e.stopPropagation(); openAddModal(node); }} />
          <Button size="small" icon={<EditOutlined />} style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); openEditModal(node); }} />
          <Button size="small" icon={<DeleteOutlined />} danger style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); handleDelete(node); }} />
        </span>
      ),
      children: node.children ? node.children.map(renderTreeNodeWithActions) : [],
    };
  }

  // Modal 열기 핸들러
  function openAddModal(parent: BomNode|null) {
    setModalType('add');
    setParentNode(parent);
    setEditingNode(null);
    form.resetFields();
    // 완제품 id 찾기
    const parentItemId = parent ? parent.data?.childItemId : products.find(p => p.itemCode === selectedProduct)?.itemCode;
    form.setFieldsValue({ parentItemId });
    setModalOpen(true);
  }
  function openEditModal(node: BomNode) {
    setModalType('edit');
    setEditingNode(node);
    setParentNode(null);
    form.setFieldsValue({
      childItemId: node.data?.childItemId || node.key,
      childName: node.data?.childName || '',
      quantity: node.data?.quantity || 1,
      parentItemId: node.data?.parentItemId || '',
    });
    setModalOpen(true);
  }

  // Modal 저장 핸들러 (API 연동)
  async function handleModalSubmit(values: BomData) {
    // 완제품 id 매핑
    const parentItemId = values.parentItemId || products.find(p => p.itemCode === selectedProduct)?.itemCode;
    const payload: BomTreeDto = {
      parentItemId: parentItemId!,
      childItemId: values.childItemId,
      childName: values.childName,
      quantity: values.quantity,
      isActive: true
    };
    if (modalType === 'add') {
      try {
        await axios.post('/api/master/bom', payload);
        message.success('BOM이 추가되었습니다.');
        setModalOpen(false);
        if (selectedProduct) fetchBomTree(selectedProduct);
      } catch (err) {
        message.error('BOM 추가에 실패했습니다.');
      }
    } else {
      try {
        if (!editingNode || !editingNode.data?.id) {
          message.error('수정할 BOM ID가 없습니다.');
          return;
        }
        await axios.put(`/api/master/bom/${editingNode.data.id}`, payload);
        message.success('BOM이 수정되었습니다.');
        setModalOpen(false);
        if (selectedProduct) fetchBomTree(selectedProduct);
      } catch (err) {
        message.error('BOM 수정에 실패했습니다.');
      }
    }
  }

  // 삭제 핸들러 (API 연동)
  function handleDelete(node: BomNode) {
    Modal.confirm({
      title: 'BOM 삭제',
      content: '정말 삭제하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      async onOk() {
        try {
          if (!node.data?.id) {
            message.error('삭제할 BOM ID가 없습니다.');
            return;
          }
          await axios.delete(`/api/master/bom/${node.data.id}`);
          message.success('BOM이 삭제되었습니다.');
          if (selectedProduct) fetchBomTree(selectedProduct);
        } catch (err) {
          message.error('BOM 삭제에 실패했습니다.');
        }
      },
    });
  }

  // 트리 새로고침 함수
  async function fetchBomTree(itemCode: string) {
    setLoading(true);
    try {
      const response = await axios.get(`/api/master/bom/${itemCode}/active`);
      let data = Array.isArray(response.data) ? response.data : [];
      if (!data || data.length === 0) {
        const selected = products.find(p => p.itemCode === itemCode);
        if (selected) {
          data = [{
            childName: selected.itemName,
            childItemId: selected.itemCode,
            parentItemId: '',
            quantity: 1,
            children: [],
          }];
        }
      }
      function attachData(nodes: BomTreeDto[]): BomNode[] {
        return nodes.map((node) => ({
          key: node.id ? node.id.toString() : node.childItemId,
          title: `${node.childName} (${node.childItemId})`,
          data: node,
          children: node.children ? attachData(node.children) : [],
        }));
      }
      setTreeData(attachData(data));
    } catch {
      setTreeData([]);
      message.error('BOM 트리를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }
};

export default BomPage;