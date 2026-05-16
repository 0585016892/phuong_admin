import React, { useEffect, useState } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Tag, message, Row,Col,
  Popconfirm, Card, Typography, Select, Tooltip, Avatar, Badge
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, FolderOpenOutlined, LinkOutlined,
  CheckCircleOutlined, EyeInvisibleOutlined,
  AppstoreOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/categoryApi";

const { Title, Text } = Typography;

export default function Categories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories({ keyword });
      setData(res.data.data || res.data || []);
    } catch (err) {
      message.error("Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [keyword]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateCategory(editing.id, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(values);
        message.success("Thêm danh mục mới thành công");
      }
      setOpen(false);
      fetchCategories();
    } catch (err) {
      message.error("Thao tác thất bại");
    }
  };

  const columns = [
    {
      title: "DANH MỤC",
      key: "category_info",
      render: (_, r) => (
        <Space size="middle" style={{ padding: '8px 0' }}>
          <div style={{ position: 'relative' }}>
            <Avatar 
              shape="circle" 
              size={48} 
              icon={<AppstoreOutlined />} 
              style={{ 
                  backgroundColor: r.status === 1 ? '#f5f3ff' : '#f8fafc', 
                  color: r.status === 1 ? '#8b5cf6' : '#cbd5e1',
                  border: `1px solid ${r.status === 1 ? '#ddd6fe' : '#e2e8f0'}`
              }} 
            />
          </div>
          <div>
            <Text strong style={{ fontSize: '15px', color: '#1e293b', display: 'block' }}>
                {r.name}
            </Text>
            <Space size={4} style={{ marginTop: 2 }}>
                <Tag color="blue" style={{ fontSize: '10px', margin: 0, borderRadius: 4, border: 'none', background: '#eff6ff', color: '#3b82f6' }}>
                    #{r.id}
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    <LinkOutlined style={{ marginRight: 4 }} />
                    {r.slug}
                </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      align: 'center',
      width: 150,
      render: (v) => (
        <Badge 
            status={v === 1 ? "success" : "default"} 
            text={
                <Text style={{ 
                    color: v === 1 ? '#10b981' : '#94a3b8', 
                    fontWeight: 500,
                    fontSize: '13px' 
                }}>
                    {v === 1 ? "Đang bán" : "Lưu kho"}
                </Text>
            } 
        />
      ),
    },
    {
      title: "THAO TÁC",
      align: 'right',
      width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
                type="text" 
                icon={<EditOutlined style={{color: '#6366f1'}} />} 
                onClick={() => openEdit(r)}
                style={{ background: '#f5f3ff', borderRadius: '8px' }}
            />
          </Tooltip>
          <Popconfirm
                title="Xóa danh mục?"
                description="Hành động này không thể hoàn tác."
                onConfirm={() => deleteCategory(r.id).then(fetchCategories)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                >
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    style={{ background: '#fff1f2', borderRadius: '8px' }}
                />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#fcfcfd', minHeight: '100vh' }}>
      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Thể loại & Phân loại</Title>
          <Text style={{ color: '#64748b' }}>Tổ chức kho sách của bạn theo các chủ đề khoa học.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          style={{ 
            borderRadius: 8, 
            height: 42, 
            background: '#6366f1',
            padding: '0 24px',
            fontWeight: 500,
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' 
          }}
          onClick={openAdd}
        >
          Thêm danh mục
        </Button>
      </div>

      {/* SEARCH & STATS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Input
                        placeholder="Tìm danh mục..."
                        allowClear
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        style={{ width: 350, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Space size="large">
                        <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>TỔNG CỘNG</Text>
                            <Text strong style={{ fontSize: '18px' }}>{data.length}</Text>
                        </div>
                    </Space>
                </div>
            </Card>
          </Col>
      </Row>

      {/* DATA TABLE */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ 
              pageSize: 7,
              showTotal: (total) => <Text type="secondary">Đang hiển thị {total} danh mục</Text>,
              position: ['bottomCenter']
          }}
          className="custom-table"
        />
      </div>

      {/* ACTION MODAL */}
      <Modal
        open={open}
        title={null}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật ngay" : "Tạo danh mục"}
        cancelText="Hủy bỏ"
        width={500}
        centered
        okButtonProps={{ style: { background: '#6366f1', borderRadius: 8, height: 40, width: 140 } }}
        cancelButtonProps={{ style: { borderRadius: 8, height: 40 } }}
        bodyStyle={{ padding: '30px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, background: '#f5f3ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FolderOpenOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
            </div>
            <Title level={4} style={{ margin: 0 }}>{editing ? "Sửa danh mục" : "Danh mục mới"}</Title>
            <Text type="secondary">Thông tin này sẽ hiển thị trực tiếp trên Website</Text>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={<Text strong style={{ color: '#475569' }}>Tên hiển thị</Text>}
            rules={[{ required: true, message: "Tên danh mục không được để trống" }]}
          >
            <Input placeholder="Nhập tên danh mục (Sách Kỹ Năng...)" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="status"
            label={<Text strong style={{ color: '#475569' }}>Cấu hình trạng thái</Text>}
            initialValue={1}
          >
            <Select size="large" style={{ width: '100%' }}>
              <Select.Option value={1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge status="success" />
                    <Text>Cho phép hiển thị công khai</Text>
                </div>
              </Select.Option>
              <Select.Option value={0}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge status="default" />
                    <Text>Chế độ lưu trữ (Ẩn)</Text>
                </div>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .custom-table .ant-table-thead > tr > th {
            background: #f8fafc !important;
            color: #64748b !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            letter-spacing: 0.05em !important;
            border-bottom: 1px solid #f1f5f9 !important;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
            background: #fcfcfd !important;
        }
        .ant-table-pagination.ant-pagination {
            margin: 24px 0 !important;
        }
      `}</style>
    </div>
  );
}