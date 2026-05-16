import React, { useEffect, useState } from "react";
import {
  Table, Tag, Switch, Space, Button, Input, Card, Typography,
  message, Tooltip, Modal, Form, Select, Popconfirm, Avatar, Row, Col, Badge
} from "antd";
import {
  SearchOutlined, DeleteOutlined, PlusOutlined,
  EditOutlined, UserOutlined, MailOutlined, PhoneOutlined,
  UserCheckOutlined, UserDeleteOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";
import {
  getUsers, toggleUserStatus, deleteUser, createUser, updateUser
} from "../api/userApi";

const { Title, Text } = Typography;

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getUsers({ page, limit: pagination.limit, keyword });
      setData(res.data.data);
      setPagination({ ...pagination, page: res.data.page, total: res.data.total });
    } catch {
      message.error("Không tải được danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [keyword]);

  const toggleStatus = async (record, checked) => {
    setStatusLoading(record.id);
    try {
      await toggleUserStatus(record.id, checked ? 1 : 0);
      message.success(`Tài khoản ${record.full_name} đã được ${checked ? 'mở khóa' : 'tạm khóa'}`);
      fetchUsers(pagination.page);
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setStatusLoading(null);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({ ...user });
    setOpen(true);
  };

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success("Cập nhật thành công");
      } else {
        await createUser(values);
        message.success("Thêm thành viên mới thành công");
      }
      setOpen(false);
      fetchUsers(editingUser ? pagination.page : 1);
    } catch (err) {}
  };

  const columns = [
    {
      title: "Thành viên",
      key: "user",
      width: 250,
      render: (_, r) => (
        <Space size="middle">
          <Badge dot status={r.status === 1 ? "success" : "error"} offset={[-5, 32]}>
            <Avatar 
              size={44}
              src={r.avatar} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: r.role === 'admin' ? '#6366f1' : '#f1f5f9',
                color: r.role === 'admin' ? '#fff' : '#475569',
                border: '1px solid #e2e8f0'
              }} 
            />
          </Badge>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ fontSize: '15px' }}>{r.full_name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>ID: #{r.id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      render: (_, r) => (
        <div style={{ lineHeight: '1.8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MailOutlined style={{ color: '#94a3b8' }} /> 
            <Text>{r.email}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneOutlined style={{ color: '#94a3b8' }} /> 
            <Text>{r.phone || <Text type="secondary" italic>Chưa cập nhật</Text>}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role) => {
        const isAdmin = role === "admin";
        return (
          <Tag 
            color={isAdmin ? "geekblue" : "default"} 
            icon={isAdmin ? <SafetyCertificateOutlined /> : <UserOutlined />}
            style={{ borderRadius: '20px', padding: '2px 12px', fontWeight: 500 }}
          >
            {isAdmin ? "QUẢN TRỊ" : "KHÁCH HÀNG"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status, record) => (
        <Space direction="vertical" size={0}>
            <Switch
                checked={status === 1}
                loading={statusLoading === record.id}
                onChange={(checked) => toggleStatus(record, checked)}
                size="small"
            />
            <Text style={{ fontSize: '10px', marginTop: '4px', display: 'block', color: status === 1 ? '#52c41a' : '#ff4d4f' }}>
                {status === 1 ? "ACTIVE" : "LOCKED"}
            </Text>
        </Space>
      ),
    },
    {
      title: "Hành động",
      align: "right",
      render: (_, r) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
                type="light" 
                shape="circle" 
                icon={<EditOutlined style={{color: '#6366f1'}} />} 
                onClick={() => openEditModal(r)} 
                style={{ border: 'none', background: '#f5f3ff' }}
            />
          </Tooltip>
          <Popconfirm 
            title="Xoá người dùng?" 
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteUser(r.id).then(() => fetchUsers(1))} 
            okText="Xóa" 
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
                shape="circle" 
                icon={<DeleteOutlined style={{color: '#ef4444'}} />} 
                style={{ border: 'none', background: '#fef2f2' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Người dùng</Title>
          <Text type="secondary">Quản lý danh sách thành viên và phân quyền truy cập hệ thống</Text>
        </div>
        <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />} 
            onClick={openAddModal} 
            style={{ borderRadius: '8px', background: '#6366f1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
        >
          Thêm thành viên
        </Button>
      </div>

      {/* Filter Card */}
      <Card bordered={false} style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm kiếm theo tên, email, sđt..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              allowClear
              size="large"
              onChange={(e) => setKeyword(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </Col>
          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
             <Space split={<div style={{ width: '1px', height: '14px', background: '#e2e8f0' }} />}>
                <div style={{ textAlign: 'left', padding: '0 16px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng số</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{pagination.total}</div>
                </div>
                <div style={{ textAlign: 'left', padding: '0 16px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Đang hoạt động</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{data.filter(u => u.status === 1).length}</div>
                </div>
             </Space>
          </Col>
        </Row>
      </Card>

      {/* Table Card */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            onChange: (page) => fetchUsers(page),
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        open={open}
        title={
          <div style={{ paddingBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>{editingUser ? "Cập nhật thành viên" : "Tạo tài khoản mới"}</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Vui lòng điền chính xác thông tin người dùng</Text>
          </div>
        }
        onOk={submitForm}
        onCancel={() => setOpen(false)}
        okText={editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
        okButtonProps={{ style: { background: '#6366f1', borderRadius: '6px' } }}
        cancelButtonProps={{ style: { borderRadius: '6px' } }}
        width={550}
        centered
      >
        <Form layout="vertical" form={form} style={{ marginTop: '10px' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="full_name" label={<Text strong>Họ và tên</Text>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label={<Text strong>Email</Text>} rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="example@mail.com" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={<Text strong>Số điện thoại</Text>}>
                <Input prefix={<PhoneOutlined />} placeholder="09xxx" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            {!editingUser && (
              <Col span={24}>
                <Form.Item name="password" label={<Text strong>Mật khẩu ban đầu</Text>} rules={[{ required: true, min: 6 }]}>
                  <Input.Password placeholder="Tối thiểu 6 ký tự" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item name="role" label={<Text strong>Quyền hạn</Text>} initialValue="user">
                <Select size="large" style={{ width: '100%' }}>
                  <Select.Option value="user">Khách hàng</Select.Option>
                  <Select.Option value="admin">Quản trị viên</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<Text strong>Trạng thái khởi tạo</Text>} initialValue={1}>
                <Select size="large" style={{ width: '100%' }}>
                  <Select.Option value={1}>Hoạt động</Select.Option>
                  <Select.Option value={0}>Khóa ngay</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}