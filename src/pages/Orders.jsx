import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Card,
  Typography,
  Modal,
  Descriptions,
  List,
  message,
  Divider,
  Badge,
  Row,
  Col,
  Statistic,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  CarOutlined,
  BookOutlined,
  PhoneOutlined,
  MailOutlined,
  TagOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getOrders, getOrderDetail, updateOrderStatus } from "../api/orderApi";

const { Title, Text } = Typography;

const STATUS_FLOW = ["pending", "paid", "shipping", "completed"];
const FINAL_STATUSES = ["completed", "cancelled"];

const STATUS_COLOR = {
  pending: {
    color: "orange",
    label: "Chờ xử lý",
    icon: <ClockCircleOutlined />,
    bg: "#fffbe6",
  },
  paid: {
    color: "blue",
    label: "Đã thanh toán",
    icon: <DollarCircleOutlined />,
    bg: "#e6f7ff",
  },
  shipping: {
    color: "cyan",
    label: "Đang giao",
    icon: <CarOutlined />,
    bg: "#e6fffb",
  },
  completed: {
    color: "green",
    label: "Hoàn thành",
    icon: <CheckCircleOutlined />,
    bg: "#f6ffed",
  },
  cancelled: {
    color: "red",
    label: "Đã hủy",
    icon: <CloseCircleOutlined />,
    bg: "#fff1f0",
  },
};

export default function Orders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  // Khởi tạo state chuẩn theo cục dữ liệu statistics mới từ API của bạn
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: "0",
    paidOrders: "0",
    shippingOrders: "0",
    completedOrders: "0",
    cancelledOrders: "0",
    totalRevenue: "0",
  });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getOrders({
        page,
        limit: pagination.limit,
        keyword,
        status,
      });

      const rawResponse = res.data || res;

      // Map data từ mảng data nằm trong object gốc
      const listData = Array.isArray(rawResponse.data) ? rawResponse.data : [];
      setData(listData);

      // Lưu trữ cụm dữ liệu thống kê từ API
      if (rawResponse.statistics) {
        setStats(rawResponse.statistics);
      }

      // Đọc chuẩn cụm cấu trúc dữ liệu phân trang mới của bạn
      if (rawResponse.pagination) {
        setPagination({
          page: Number(rawResponse.pagination.page) || page,
          limit: Number(rawResponse.pagination.limit) || 10,
          total: Number(rawResponse.pagination.total) || 0,
        });
      } else {
        setPagination((prev) => ({
          ...prev,
          page: rawResponse.page || page,
          total: rawResponse.total || 0,
        }));
      }
    } catch (err) {
      message.error("Không tải được danh sách đơn hàng");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [keyword, status]);

  const openDetail = async (id) => {
    try {
      setBtnLoading(id);
      const res = await getOrderDetail(id);
      setDetail(res.data || res);
      setOpen(true);
    } catch {
      message.error("Lỗi tải chi tiết");
    } finally {
      setBtnLoading(false);
    }
  };

  const changeStatus = async (id, value) => {
    try {
      await updateOrderStatus(id, value);
      message.success("Cập nhật trạng thái thành công");
      if (detail && detail.id === id) setDetail({ ...detail, status: value });
      fetchOrders(pagination.page);
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const isStatusDisabled = (currentStatus, optionStatus) => {
    if (FINAL_STATUSES.includes(currentStatus)) return true;
    if (optionStatus === "cancelled") return false;
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const optionIndex = STATUS_FLOW.indexOf(optionStatus);
    return optionIndex <= currentIndex;
  };

  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "order_code",
      key: "order_code",
      render: (text) => (
        <Text
          strong
          style={{ color: "#1677ff", fontFamily: "monospace", fontSize: 14 }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Khách Hàng",
      key: "customer",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.customer_name || `User ID: ${r.user_id}`}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {r.customer_phone || "Chưa cập nhật SĐT"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tổng Tiền Đơn",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (v) => (
        <Text strong style={{ color: "#cf1322", fontSize: 15 }}>
          {Number(v || 0).toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Trạng Thái Vận Chuyển",
      dataIndex: "status",
      key: "status",
      render: (v, r) => {
        const config = STATUS_COLOR[v] || {
          color: "default",
          label: v,
          icon: null,
        };
        return (
          <Select
            value={v}
            style={{ width: 160 }}
            variant="borderless"
            disabled={FINAL_STATUSES.includes(v)}
            onChange={(value) => changeStatus(r.id, value)}
            dropdownStyle={{ borderRadius: 8 }}
          >
            {Object.entries(STATUS_COLOR).map(([key, item]) => (
              <Select.Option
                key={key}
                value={key}
                disabled={isStatusDisabled(v, key)}
              >
                <Tag
                  icon={item.icon}
                  color={item.color}
                  style={{ border: "none", borderRadius: 6, margin: 0 }}
                >
                  {item.label}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Ngày Tạo Đơn",
      dataIndex: "created_at",
      key: "created_at",
      render: (v) => (
        <Space size={4} style={{ color: "#8c8c8c" }}>
          <CalendarOutlined style={{ fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {dayjs(v).format("DD/MM/YYYY HH:mm")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, r) => (
        <Button
          type="primary"
          ghost
          shape="round"
          size="small"
          icon={<EyeOutlined />}
          loading={btnLoading === r.id}
          onClick={() => openDetail(r.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER SECTION */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12}>
          <Space direction="vertical" size={2}>
            <Title
              level={2}
              style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              Hệ thống Quản lý Đơn Hàng
            </Title>
            <Text type="secondary">
              Theo dõi, kiểm tra và duyệt luồng vận đơn hệ thống cửa hàng
            </Text>
          </Space>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => fetchOrders(pagination.page)}
            style={{
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(22, 119, 255, 0.15)",
            }}
          >
            Làm mới dữ liệu
          </Button>
        </Col>
      </Row>

      {/* STATS CARDS SECTION - Hiện full 6 chỉ số từ API của bạn */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} xl={4}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Statistic
              title={
                <Text type="secondary" strong>
                  Tổng số đơn
                </Text>
              }
              value={stats.totalOrders}
              prefix={
                <ShoppingCartOutlined
                  style={{ color: "#1677ff", marginRight: 6 }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: STATUS_COLOR.pending.color }} strong>
                  Chờ xử lý
                </Text>
              }
              value={Number(stats.pendingOrders || 0)}
              valueStyle={{ color: STATUS_COLOR.pending.color }}
              prefix={STATUS_COLOR.pending.icon}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: STATUS_COLOR.paid.color }} strong>
                  Đã trả tiền
                </Text>
              }
              value={Number(stats.paidOrders || 0)}
              valueStyle={{ color: STATUS_COLOR.paid.color }}
              prefix={STATUS_COLOR.paid.icon}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: STATUS_COLOR.shipping.color }} strong>
                  Đang giao hàng
                </Text>
              }
              value={Number(stats.shippingOrders || 0)}
              valueStyle={{ color: STATUS_COLOR.shipping.color }}
              prefix={STATUS_COLOR.shipping.icon}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: STATUS_COLOR.completed.color }} strong>
                  Hoàn thành
                </Text>
              }
              value={Number(stats.completedOrders || 0)}
              valueStyle={{ color: STATUS_COLOR.completed.color }}
              prefix={STATUS_COLOR.completed.icon}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <Statistic
              title={
                <Text style={{ color: STATUS_COLOR.cancelled.color }} strong>
                  Đã hủy bỏ
                </Text>
              }
              value={Number(stats.cancelledOrders || 0)}
              valueStyle={{ color: STATUS_COLOR.cancelled.color }}
              prefix={STATUS_COLOR.cancelled.icon}
            />
          </Card>
        </Col>
      </Row>

      {/* DOANH THU BOX & BỘ LỌC */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: "linear-gradient(135deg, #2f54eb 0%, #1677ff 100%)",
              color: "#fff",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Statistic
              title={
                <span
                  style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}
                >
                  TỔNG DOANH THU THỰC
                </span>
              }
              value={Number(stats.totalRevenue || 0)}
              suffix=" ₫"
              valueStyle={{ color: "#fff", fontWeight: 800, fontSize: 26 }}
              prefix={<WalletOutlined style={{ marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Space size="large" wrap style={{ width: "100%" }}>
              <Input.Search
                placeholder="Tìm nhanh mã vận đơn, mã KH..."
                allowClear
                onSearch={() => fetchOrders(1)}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 320 }}
                size="large"
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              />
              <Select
                size="large"
                placeholder="Lọc trạng thái vận đơn"
                allowClear
                style={{ width: 220 }}
                onChange={setStatus}
              >
                {Object.entries(STATUS_COLOR).map(([key, config]) => (
                  <Select.Option key={key} value={key}>
                    <Space>
                      <span style={{ color: config.color }}>{config.icon}</span>
                      {config.label}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* MAIN DATA TABLE */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}
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
            onChange: (page) => fetchOrders(page),
            showTotal: (total) => `Tổng số ${total} đơn hàng phân phối`,
          }}
        />
      </Card>

      {/* CHI TIẾT VẬN ĐƠN MODAL */}
      <Modal
        open={open}
        width={950}
        centered
        onCancel={() => setOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => setOpen(false)}
          >
            Đóng cửa sổ
          </Button>,
        ]}
        title={
          <Space size={8}>
            <ShoppingCartOutlined style={{ color: "#1677ff", fontSize: 20 }} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              Thông Tin Vận Đơn:{" "}
              {detail?.order_code || detail?.order?.order_code}
            </span>
          </Space>
        }
      >
        {detail && (
          <Row gutter={24} style={{ marginTop: 20 }}>
            {/* Cột trái: Khách hàng & Sản phẩm */}
            <Col xs={24} md={14}>
              <Divider orientation="left" style={{ margin: "0 0 16px" }}>
                Thông tin khách nhận
              </Divider>
              <Descriptions
                column={2}
                bordered
                size="small"
                style={{ background: "#fafafa" }}
              >
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> Tên
                    </>
                  }
                >
                  {detail.order?.customer_name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> SĐT
                    </>
                  }
                >
                  {detail.order?.customer_phone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> Email
                    </>
                  }
                  span={2}
                >
                  {detail.order?.customer_email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú nhận" span={2}>
                  <Text
                    italic
                    type={
                      detail.order?.status === "cancelled"
                        ? "danger"
                        : "secondary"
                    }
                  >
                    {detail.order?.note || "Không để lại ghi chú gì."}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức mua" span={2}>
                  <Badge
                    status="processing"
                    text={detail.order?.payment || "Thanh toán Cod"}
                  />
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left" style={{ margin: "24px 0 16px" }}>
                Sản phẩm đặt trong đơn
              </Divider>
              <div
                style={{ maxHeight: 280, overflowY: "auto", paddingRight: 8 }}
              >
                <List
                  dataSource={detail.items || []}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "12px 0" }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            size={44}
                            icon={<BookOutlined />}
                            style={{
                              backgroundColor: "#f0f5ff",
                              color: "#2f54eb",
                            }}
                          />
                        }
                        title={
                          <Text strong>
                            {item.product_name || "Tên sách hệ thống"}
                          </Text>
                        }
                        description={
                          <Text type="secondary">
                            {item.quantity} cuốn x{" "}
                            {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                          </Text>
                        }
                      />
                      <Text strong style={{ fontSize: 14 }}>
                        {Number(
                          item.total || item.quantity * item.price,
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </Text>
                    </List.Item>
                  )}
                />
              </div>
            </Col>

            {/* Cột phải: Tính tiền & Trạng thái */}
            <Col xs={24} md={10}>
              <Divider orientation="left" style={{ margin: "0 0 16px" }}>
                Tổng kết dòng tiền
              </Divider>
              <Card
                bordered={false}
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Giá trị hàng">
                    {Number(detail.order?.total_amount || 0).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    ₫
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiết khấu giảm giá">
                    <Text type="danger">
                      -
                      {Number(
                        detail.order?.discount_amount || 0,
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </Text>
                  </Descriptions.Item>
                  {detail.order?.coupon_code && (
                    <Descriptions.Item
                      label={
                        <>
                          <TagOutlined /> Voucher
                        </>
                      }
                    >
                      <Tag color="magenta">{detail.order.coupon_code}</Tag>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item
                    label={<Text strong>Khách trả thực tế</Text>}
                  >
                    <Text strong style={{ fontSize: 20, color: "#cf1322" }}>
                      {Number(
                        detail.order?.final_amount ||
                          detail.order?.total_amount ||
                          0,
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Divider orientation="left" style={{ margin: "0 0 16px" }}>
                Cập nhật tiến trình vận đơn
              </Divider>
              <Select
                style={{ width: "100%" }}
                size="large"
                value={detail.order?.status}
                disabled={FINAL_STATUSES.includes(detail.order?.status)}
                onChange={(v) => changeStatus(detail.order?.id, v)}
              >
                {Object.entries(STATUS_COLOR).map(([key, config]) => (
                  <Select.Option
                    key={key}
                    value={key}
                    disabled={isStatusDisabled(detail.order?.status, key)}
                  >
                    <Space>
                      <span style={{ color: config.color }}>{config.icon}</span>
                      {config.label}
                    </Space>
                  </Select.Option>
                ))}
              </Select>

              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <ClockCircleOutlined /> Khởi tạo lúc:{" "}
                  {dayjs(detail.order?.created_at).format("HH:mm - DD/MM/YYYY")}
                </Text>
              </div>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
}
