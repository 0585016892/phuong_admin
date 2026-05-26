import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Switch,
  Space,
  Button,
  Input,
  Card,
  Typography,
  message,
  Tooltip,
  Modal,
  Form,
  Select,
  Popconfirm,
  Avatar,
  Row,
  Col,
  Badge,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  ArrowRightOutlined,
  UserAddOutlined, // Nếu bạn cần icon thêm người dùng
  CheckCircleOutlined, // Dùng thay cho UserCheck (Hoạt động)
  StopOutlined, // Dùng thay cho UserDelete (Bị khóa)
  UsergroupAddOutlined, // Dùng cho phần tổng nhân sự
} from "@ant-design/icons";
import {
  getUsers,
  toggleUserStatus,
  deleteUser,
  createUser,
  updateUser,
} from "../api/userApi";

const { Title, Text } = Typography;

// Custom Hook để xử lý Debounce tìm kiếm
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Users() {
  /* ================= STATES ================= */
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchKey, setSearchKey] = useState(""); // Input trung gian
  const [filters, setFilters] = useState({
    role: undefined,
    status: undefined,
  });

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(searchKey, 500);

  /* ================= FETCH DATA ================= */
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await getUsers({
          page,
          limit: pagination.limit,
          keyword: debouncedSearch,
          ...filters,
        });
        setData(res.data.data);
        setPagination((prev) => ({
          ...prev,
          page: res.data.page,
          total: res.data.total,
        }));
      } catch (err) {
        message.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filters, pagination.limit],
  );

  useEffect(() => {
    fetchUsers(1);
  }, [debouncedSearch, filters, fetchUsers]);

  /* ================= HANDLERS ================= */
  const handleToggleStatus = async (record, checked) => {
    setStatusLoading(record.id);
    try {
      await toggleUserStatus(record.id, checked ? 1 : 0);
      message.success(`Đã cập nhật trạng thái cho ${record.full_name}`);
      setData((prev) =>
        prev.map((u) =>
          u.id === record.id ? { ...u, status: checked ? 1 : 0 } : u,
        ),
      );
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setStatusLoading(null);
    }
  };

  const onFinish = async (values) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success("Cập nhật thành công");
      } else {
        await createUser(values);
        message.success("Thêm thành viên mới thành công");
      }
      setOpen(false);
      fetchUsers(editingUser ? pagination.page : 1);
    } catch (err) {
      message.error("Thao tác thất bại, vui lòng kiểm tra lại");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "THÀNH VIÊN",
      key: "user",
      render: (_, r) => (
        <Space size="middle">
          <Badge
            dot
            status={r.status === 1 ? "success" : "error"}
            offset={[-4, 38]}
          >
            <Avatar
              size={48}
              src={r.avatar}
              icon={<UserOutlined />}
              style={{ background: "#eef2ff", color: "#4f46e5" }}
            />
          </Badge>
          <div>
            <Text strong style={{ fontSize: 15, color: "#1e293b" }}>
              {r.full_name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: #{r.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "LIÊN HỆ",
      key: "contact",
      render: (_, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text style={{ fontSize: 13 }}>
            <MailOutlined style={{ marginRight: 8, color: "#94a3b8" }} />
            {r.email}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <PhoneOutlined style={{ marginRight: 8, color: "#94a3b8" }} />
            {r.phone || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      render: (role) => (
        <Tag
          icon={
            role === "admin" ? <SafetyCertificateOutlined /> : <UserOutlined />
          }
          color={role === "admin" ? "blue-inverse" : "default"}
          style={{ borderRadius: 6, padding: "2px 8px" }}
        >
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      align: "center",
      render: (s, r) => (
        <Switch
          checked={s === 1}
          loading={statusLoading === r.id}
          onChange={(checked) => handleToggleStatus(r, checked)}
          size="small"
        />
      ),
    },
    {
      title: "THAO TÁC",
      align: "right",
      render: (_, r) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#6366f1" }} />}
              onClick={() => {
                setEditingUser(r);
                form.setFieldsValue(r);
                setOpen(true);
              }}
              style={{ background: "#f5f3ff" }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng này?"
            onConfirm={() => deleteUser(r.id).then(() => fetchUsers(1))}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              style={{ background: "#fef2f2" }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px 40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* SECTION 1: STATS */}
      <Row gutter={20} style={{ marginBottom: 32 }}>
        {[
          {
            label: "Tổng nhân sự",
            val: pagination.total,
            icon: <TeamOutlined />,
            color: "#4f46e5",
          },
          {
            label: "Đang hoạt động",
            val: data.filter((u) => u.status === 1).length,
            icon: <CheckCircleOutlined />,
            color: "#10b981",
          },
          {
            label: "Đã khóa",
            val: data.filter((u) => u.status === 0).length,
            icon: <UserDeleteOutlined />,
            color: "#f43f5e",
          },
        ].map((item, i) => (
          <Col span={8} key={i}>
            <Card
              bordered={false}
              bodyStyle={{ padding: 24 }}
              style={{
                borderRadius: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Text type="secondary" strong style={{ fontSize: 13 }}>
                    {item.label}
                  </Text>
                  <Title level={2} style={{ margin: "8px 0 0" }}>
                    {item.val}
                  </Title>
                </div>
                <div
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* SECTION 2: HEADER & FILTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Quản lý hệ thống
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setOpen(true);
          }}
          style={{
            background: "#1e293b",
            border: "none",
            borderRadius: 10,
            height: 45,
          }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Card bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
        <Row gutter={16}>
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined style={{ color: "#cbd5e1" }} />}
              placeholder="Tìm tên, email hoặc số điện thoại..."
              size="large"
              allowClear
              onChange={(e) => setSearchKey(e.target.value)}
              style={{ borderRadius: 10 }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Vai trò"
              size="large"
              style={{ width: "100%" }}
              allowClear
              onChange={(v) => setFilters((f) => ({ ...f, role: v }))}
              options={[
                { label: "Admin", value: "admin" },
                { label: "User", value: "user" },
              ]}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              size="large"
              style={{ width: "100%" }}
              allowClear
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={[
                { label: "Hoạt động", value: 1 },
                { label: "Bị khóa", value: 0 },
              ]}
            />
          </Col>
          <Col>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => fetchUsers(1)}
              style={{ borderRadius: 10 }}
            />
          </Col>
        </Row>
      </Card>

      {/* SECTION 3: TABLE */}
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            onChange: (p) => fetchUsers(p),
            showSizeChanger: false,
            style: { padding: "16px 24px" },
          }}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal
        title={
          <Title level={4}>
            {editingUser ? "Cập nhật tài khoản" : "Khởi tạo thành viên"}
          </Title>
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={580}
        centered
        okText="Lưu thông tin"
        cancelText="Đóng"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input size="large" placeholder="Nhập tên đầy đủ..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input
                  size="large"
                  placeholder="email@example.com"
                  disabled={!!editingUser}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input size="large" placeholder="09xxxxxxx" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu bảo mật"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password size="large" placeholder="Tối thiểu 6 ký tự" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Quyền truy cập" initialValue="user">
                <Select
                  size="large"
                  options={[
                    { label: "Khách hàng", value: "user" },
                    { label: "Quản trị viên", value: "admin" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái tài khoản"
                initialValue={1}
              >
                <Select
                  size="large"
                  options={[
                    { label: "Kích hoạt", value: 1 },
                    { label: "Tạm khóa", value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th { 
          background: #fcfcfd !important; 
          color: #64748b !important; 
          font-weight: 700 !important; 
          font-size: 11px !important;
          text-transform: uppercase;
        }
        .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
        .ant-modal-content { borderRadius: 20px !important; overflow: hidden; }
      `}</style>
    </div>
  );
}
