import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Popconfirm,
  InputNumber,
  Select,
  Upload,
  Image,
  Card,
  Typography,
  Tooltip,
  Switch,
  Divider,
  Badge,
  Row,
  Col,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  SearchOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  PictureOutlined,
  ReloadOutlined,
  InboxOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  updateStatusBook,
  getBookById,
} from "../api/productApi";
import { getCategories } from "../api/categoryApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingBook, setViewingBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    category_id: undefined,
    min_price: undefined,
    max_price: undefined,
  });

  /* ================= FETCH DATA ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getBooks(filters);
      setData(Array.isArray(res?.data) ? res.data : res.data?.data || []);
    } catch {
      message.error("Không tải được danh sách tác phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = async () => {
    try {
      const res = await getCategories({ limit: 100 });
      setCategories(res.data?.data || res.data || []);
    } catch {
      message.error("Lỗi tải danh mục");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCats();
  }, []);

  /* ================= HANDLERS ================= */
  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      category_id: undefined,
      min_price: undefined,
      max_price: undefined,
    });
    fetchProducts();
  };

  const toggleStatus = async (record, checked) => {
    setStatusLoading(record.id);
    try {
      const newStatus = checked ? 1 : 0;
      await updateStatusBook(record.id, { status: newStatus });
      message.success(`Trạng thái "${record.title}" đã được cập nhật`);
      setData((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await getBookById(id);
      setViewingBook(res.data || res);
      setDetailOpen(true);
    } catch (err) {
      message.error("Không lấy được thông tin chi tiết");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k !== "images" && v !== undefined && v !== null)
        formData.append(k, v);
    });

    if (values.images?.fileList) {
      values.images.fileList.forEach((file) => {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      });
    }

    try {
      if (editing) {
        await updateBook(editing.id, formData);
        message.success("Cập nhật thành công");
      } else {
        await createBook(formData);
        message.success("Thêm sách thành công");
      }
      setOpen(false);
      fetchProducts();
    } catch (e) {
      message.error("Thao tác thất bại");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "SẢN PHẨM",
      key: "product",
      width: 350,
      render: (_, r) => (
        <Space size="middle">
          <Badge count={r.sale_price ? "Sale" : 0} size="small">
            <Image
              width={60}
              height={85}
              style={{
                borderRadius: 8,
                objectFit: "cover",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              src={
                r.images?.[0]
                  ? `${process.env.REACT_APP_WEB_URL}${r.images[0].image_url}`
                  : ""
              }
              fallback="https://via.placeholder.com/60x85?text=No+Img"
            />
          </Badge>
          <div style={{ maxWidth: 240 }}>
            <Text
              strong
              style={{ fontSize: 15, display: "block", color: "#1e293b" }}
              ellipsis={{ tooltip: r.title }}
            >
              {r.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tác giả: {r.author || "N/A"}
            </Text>
            <div style={{ marginTop: 6 }}>
              <Tag
                color="purple"
                bordered={false}
                style={{ fontSize: 11, borderRadius: 4 }}
              >
                {categories.find((c) => c.id === r.category_id)?.name ||
                  "Default"}
              </Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "GIÁ BÁN",
      key: "price",
      width: 150,
      render: (_, r) => {
        const price = Number(r.price || 0);
        const salePrice = r.sale_price ? Number(r.sale_price) : null;
        return (
          <div style={{ lineHeight: 1.2 }}>
            {salePrice ? (
              <>
                <Text strong style={{ color: "#ef4444", fontSize: 16 }}>
                  {salePrice.toLocaleString()} ₫
                </Text>
                <br />
                <Text delete type="secondary" style={{ fontSize: 12 }}>
                  {price.toLocaleString()} ₫
                </Text>
              </>
            ) : (
              <Text strong style={{ color: "#0f172a", fontSize: 16 }}>
                {price.toLocaleString()} ₫
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "TỒN KHO",
      dataIndex: "stock",
      align: "center",
      render: (v) => {
        let color = v > 20 ? "green" : v > 0 ? "orange" : "red";
        let label = v > 20 ? "Sẵn hàng" : v > 0 ? "Sắp hết" : "Hết hàng";
        return (
          <Tooltip title={`${v} cuốn trong kho`}>
            <Tag
              color={color}
              style={{ borderRadius: 10, padding: "0 10px", border: "none" }}
            >
              {v} - {label}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "HIỂN THỊ",
      dataIndex: "status",
      align: "center",
      render: (s, r) => (
        <Switch
          checkedChildren="On"
          unCheckedChildren="Off"
          checked={s === 1}
          loading={statusLoading === r.id}
          onChange={(c) => toggleStatus(r, c)}
        />
      ),
    },
    {
      title: "THAO TÁC",
      align: "right",
      render: (_, r) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#6366f1" }} />}
            onClick={() => handleViewDetail(r.id)}
            style={{ background: "#f5f3ff" }}
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#0ea5e9" }} />}
            onClick={() => {
              setEditing(r);
              setOpen(true);
              const initialImages =
                r.images?.map((img, index) => ({
                  uid: index,
                  name: `img-${index}`,
                  status: "done",
                  url: `${process.env.REACT_APP_WEB_URL}${img.image_url}`,
                })) || [];
              form.setFieldsValue({
                ...r,
                images: { fileList: initialImages },
              });
            }}
            style={{ background: "#f0f9ff" }}
          />
          <Popconfirm
            title="Xóa tác phẩm này?"
            onConfirm={() => deleteBook(r.id).then(fetchProducts)}
            okText="Xóa"
            cancelText="Hủy"
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
    <div style={{ padding: "32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
        }}
      >
        <div>
          <Title
            level={2}
            style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}
          >
            Danh mục Sản phẩm
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Quản lý kho hàng, giá bán và các chương trình ưu đãi của bạn
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{
            borderRadius: 10,
            height: 48,
            background: "#6366f1",
            fontWeight: 600,
            padding: "0 24px",
          }}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Tìm theo tên sách, tác giả..."
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
              style={{ borderRadius: 10, height: 42 }}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Chọn danh mục"
              style={{ width: "100%", height: 42 }}
              allowClear
              value={filters.category_id}
              onChange={(v) => setFilters({ ...filters, category_id: v })}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Col>
          <Col xs={24} md={7}>
            <div style={{ display: "flex", gap: 8 }}>
              <InputNumber
                placeholder="Giá từ"
                style={{ flex: 1, borderRadius: 10, height: 42, paddingTop: 5 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                value={filters.min_price}
                onChange={(v) => setFilters({ ...filters, min_price: v })}
              />
              <InputNumber
                placeholder="Đến"
                style={{ flex: 1, borderRadius: 10, height: 42, paddingTop: 5 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                value={filters.max_price}
                onChange={(v) => setFilters({ ...filters, max_price: v })}
              />
            </div>
          </Col>
          <Col xs={24} md={4} style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchProducts}
              style={{
                flex: 1,
                borderRadius: 10,
                height: 42,
                background: "#1e293b",
              }}
            >
              Lọc
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ height: 42, borderRadius: 10 }}
            />
          </Col>
        </Row>
      </Card>

      {/* TABLE DATA */}
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
            style: { padding: "16px 24px" },
          }}
        />
      </Card>

      {/* MODAL: ADD/EDIT FORM */}
      <Modal
        title={editing ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={800}
        centered
        okText="Lưu dữ liệu"
        cancelText="Hủy bỏ"
        bodyStyle={{ paddingTop: 16 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col span={16}>
              <div className="form-section">
                <Title level={5}>
                  <InfoCircleOutlined /> Thông tin cơ bản
                </Title>
                <Form.Item
                  name="title"
                  label="Tên sản phẩm"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập tiêu đề sách..." />
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name="author"
                      label="Tác giả"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Tên tác giả" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="category_id"
                      label="Danh mục"
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={categories.map((c) => ({
                          label: c.name,
                          value: c.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="description" label="Mô tả sản phẩm">
                  <TextArea rows={4} placeholder="Viết mô tả ngắn..." />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div
                className="form-section"
                style={{ background: "#f8fafc", padding: 16, borderRadius: 8 }}
              >
                <Title level={5}>
                  <BarChartOutlined /> Định giá & Kho
                </Title>
                <Form.Item
                  name="price"
                  label="Giá niêm yết"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    addonAfter="đ"
                  />
                </Form.Item>
                <Form.Item name="sale_price" label="Giá khuyến mãi">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    addonAfter="đ"
                  />
                </Form.Item>
                <Form.Item
                  name="stock"
                  label="Số lượng tồn"
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>

                <Divider style={{ margin: "12px 0" }} />

                <Title level={5}>
                  <PictureOutlined /> Hình ảnh
                </Title>
                <Form.Item name="images">
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Ảnh bìa</div>
                    </div>
                  </Upload>
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL: DETAIL VIEW */}
      <Modal
        open={detailOpen}
        footer={null}
        onCancel={() => setDetailOpen(false)}
        width={700}
        centered
        bodyStyle={{ padding: 0 }}
      >
        {viewingBook && (
          <Row>
            <Col span={10}>
              <Image
                src={
                  viewingBook.images?.[0]
                    ? `${process.env.REACT_APP_WEB_URL}${viewingBook.images[0].image_url}`
                    : ""
                }
                fallback="https://via.placeholder.com/300x400"
                preview={false}
                style={{ height: "100%", objectFit: "cover" }}
              />
            </Col>
            <Col span={14} style={{ padding: 32 }}>
              <Tag color="blue">
                {categories.find((c) => c.id === viewingBook.category_id)?.name}
              </Tag>
              <Title level={3} style={{ marginTop: 12 }}>
                {viewingBook.title}
              </Title>
              <Text type="secondary">
                Tác giả: <Text strong>{viewingBook.author}</Text>
              </Text>

              <div
                style={{
                  margin: "24px 0",
                  padding: 16,
                  background: "#f0f9ff",
                  borderRadius: 8,
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Text size="small" type="secondary">
                      GIÁ BÁN
                    </Text>
                    <br />
                    <Text strong style={{ fontSize: 20, color: "#0ea5e9" }}>
                      {Number(
                        viewingBook.sale_price || viewingBook.price,
                      ).toLocaleString()}
                      đ
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text size="small" type="secondary">
                      TỒN KHO
                    </Text>
                    <br />
                    <Text strong style={{ fontSize: 20 }}>
                      {viewingBook.stock} cuốn
                    </Text>
                  </Col>
                </Row>
              </div>

              <Paragraph
                ellipsis={{ rows: 4, expandable: true, symbol: "Xem thêm" }}
              >
                {viewingBook.description || "Không có mô tả chi tiết."}
              </Paragraph>

              <Space style={{ marginTop: 24 }}>
                <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
              </Space>
            </Col>
          </Row>
        )}
      </Modal>

      <style>{`
        .ant-table-thead > tr > th {
            background: #f1f5f9 !important;
            font-size: 12px !important;
            letter-spacing: 0.5px !important;
            color: #64748b !important;
            font-weight: 700 !important;
        }
        .ant-table-tbody > tr:hover > td {
            background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
