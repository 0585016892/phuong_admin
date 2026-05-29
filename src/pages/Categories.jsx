import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  message,
  Row,
  Col,
  Popconfirm,
  Card,
  Typography,
  Select,
  Tooltip,
  Avatar,
  Badge,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined,
  LinkOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Categories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();

  // ======================================================
  // CHUYỂN ĐỔI LIST PHẲNG THÀNH CẤU TRÚC CÂY (TREE DATA)
  // ======================================================
  const listToTree = (list) => {
    const map = {};
    const roots = [];

    // Tạo bản đồ id -> index
    list.forEach((item, index) => {
      map[item.id] = { ...item, key: item.id }; // Đảm bảo luôn có key
    });

    list.forEach((item) => {
      const mappedItem = map[item.id];
      if (item.parent_id !== 0 && map[item.parent_id]) {
        // Nếu có cha, đẩy vào mảng children của cha
        if (!map[item.parent_id].children) {
          map[item.parent_id].children = [];
        }
        map[item.parent_id].children.push(mappedItem);
      } else {
        // Nếu không có cha (hoặc cha không tồn tại), coi như gốc
        roots.push(mappedItem);
      }
    });

    return roots;
  };

  // Tách riêng mảng phẳng để dùng cho ô Select chọn danh mục cha
  const flatCategories = data;
  // Dữ liệu dạng cây dùng cho Table
  const treeData = listToTree(data);

  // Lọc danh sách làm danh mục cha (Bỏ chính nó và các con nếu đang edit để tránh vòng lặp vô tận)
  const availableParents = flatCategories.filter((item) => {
    if (editing && item.id === editing.id) return false;
    // (Tùy chọn nâng cao): Có thể lọc thêm các con của 'editing' nếu cần thiết
    return true;
  });

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await getCategories({
        keyword,
        page,
        limit,
      });

      console.log(res);

      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.log(error);
      message.error("Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [keyword, page, limit]);

  // ======================================================
  // ACTIONS
  // ======================================================
  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      parent_id: 0,
    });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      status: record.status,
      parent_id: record.parent_id,
    });
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
        message.success("Thêm danh mục thành công");
      }
      setOpen(false);
      fetchCategories();
    } catch (error) {
      console.log(error);
      message.error(error?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      console.log(error);
      message.error(error?.response?.data?.message || "Xóa thất bại");
    }
  };

  // ======================================================
  // COLUMNS DEFINITION
  // ======================================================
  const columns = [
    {
      title: "DANH MỤC",
      key: "category",
      render: (_, r) => (
        <Space size={14}>
          <Avatar
            size={40}
            icon={<AppstoreOutlined />}
            style={{
              background: r.status === 1 ? "#eef2ff" : "#f1f5f9",
              color: r.status === 1 ? "#6366f1" : "#94a3b8",
            }}
          />
          <div>
            <Text strong style={{ display: "block", fontSize: 14 }}>
              {r.name}
            </Text>
            <Space size={6}>
              <Tag
                color="blue"
                style={{ borderRadius: 6, margin: 0, fontSize: 11 }}
              >
                #{r.id}
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <LinkOutlined /> {r.slug}
              </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "CẤP ĐỘ",
      key: "level",
      width: 150,
      render: (_, r) => {
        const isRoot = r.parent_id === 0;
        return (
          <Tag color={isRoot ? "purple" : "orange"} style={{ borderRadius: 6 }}>
            {isRoot ? "Danh mục gốc" : "Danh mục con"}
          </Tag>
        );
      },
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      align: "center",
      width: 150,
      render: (v) => (
        <Badge
          status={v === 1 ? "success" : "default"}
          text={
            <Text
              style={{
                color: v === 1 ? "#10b981" : "#94a3b8",
                fontWeight: 500,
              }}
            >
              {v === 1 ? "Đang hiển thị" : "Đã ẩn"}
            </Text>
          }
        />
      ),
    },
    {
      title: "THAO TÁC",
      align: "right",
      width: 140,
      render: (_, r) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#6366f1" }} />}
              style={{ background: "#eef2ff", borderRadius: 8 }}
              onClick={() => openEdit(r)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa danh mục?"
            description="Lưu ý: Xóa danh mục cha sẽ ảnh hưởng đến hiển thị các con!"
            onConfirm={() => handleDelete(r.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              style={{ background: "#fff1f2", borderRadius: 8 }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý danh mục
          </Title>
          <Text type="secondary">Xem danh mục theo cấu trúc sơ đồ cây</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openAdd}
          style={{
            background: "#6366f1",
            borderRadius: 10,
            height: 42,
            paddingInline: 24,
            fontWeight: 600,
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      {/* SEARCH CARD */}
      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Input
            allowClear
            placeholder="Tìm nhanh danh mục..."
            prefix={<SearchOutlined />}
            style={{ width: 350, borderRadius: 10 }}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
          <div style={{ textAlign: "right" }}>
            <Text type="secondary">Tổng số lượng</Text>
            <Title level={4} style={{ margin: 0 }}>
              {data.length}
            </Title>
          </div>
        </div>
      </Card>

      {/* TREE TABLE CARD */}
      <Card bordered={false} style={{ borderRadius: 18 }}>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={treeData} // Sử dụng dữ liệu cây đã convert
          expandable={{
            defaultExpandAllRows: true, // Tự động bung hết các nhánh cây khi load dữ liệu
            indentSize: 24, // Khoảng cách thụt lề cho danh mục con (tính bằng px)
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => `Tổng ${total} danh mục`,
            onChange: (newPage, newSize) => {
              setPage(newPage);
              setLimit(newSize);
            },
          }}
        />
      </Card>

      {/* MODAL ADD/EDIT */}
      <Modal
        open={open}
        centered
        width={500}
        title={null}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Cập nhật" : "Tạo danh mục"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: "#6366f1",
            borderRadius: 8,
            height: 40,
            minWidth: 120,
          },
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 12px",
              borderRadius: 16,
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FolderOpenOutlined style={{ fontSize: 24, color: "#6366f1" }} />
          </div>
          <Title level={4}>
            {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
          </Title>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input
              size="large"
              placeholder="Nhập tên danh mục..."
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item label="Danh mục cha" name="parent_id">
            <Select size="large" style={{ width: "100%" }}>
              <Option value={0}>Danh mục gốc (Không có cha)</Option>
              {availableParents.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select size="large" style={{ width: "100%" }}>
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* CUSTOM CSS ĐỂ THẨM MỸ HƠN */}
      <style>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          font-size: 12px !important;
          color: #64748b !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #f1f5f9 !important;
        }
        /* Style cho icon đóng mở rộng cây */
        .ant-table-row-expand-icon {
          border-radius: 4px !important;
          border: 1px solid #cbd5e1 !important;
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
}
