import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Empty,
  Table,
  Tag,
  Avatar,
  Space,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom"; // Import ở đầu file
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  FireOutlined,
  HistoryOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  MoreOutlined,
  ReloadOutlined,
  AreaChartOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Area, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { dashboardApi } from "../api/dashboardApi";

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate(); // Khởi tạo hook bên trong function component
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setData(res.data);
    } catch (err) {
      console.error("DASHBOARD_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div style={centerStyle}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary" strong>
            Đang đồng bộ dữ liệu...
          </Text>
        </Space>
      </div>
    );

  if (!data)
    return <Empty style={{ marginTop: 100 }} description="Không có dữ liệu" />;

  const totalRevenue =
    data.tables?.latestOrders?.reduce(
      (sum, order) => sum + parseFloat(order.final_amount),
      0,
    ) || 0;

  // BIỂU ĐỒ DIỆN TÍCH (Thay Column bằng Area để mượt mà hơn)
  const revenueConfig = {
    data: data?.charts?.dailyRevenue || [],
    xField: (d) => dayjs(d.date).format("DD/MM"),
    yField: "revenue",
    smooth: true,
    areaStyle: { fill: "l(270) 0:#ffffff 0.5:#6366f1 1:#6366f1" },
    line: { color: "#6366f1", size: 3 },
    tooltip: {
      title: "date",
      items: [
        {
          channel: "y",
          name: "Doanh thu",
          valueFormatter: (v) => `${Number(v).toLocaleString()}₫`,
        },
      ],
    },
    axis: { y: { labelFormatter: (v) => `${Number(v) / 1000000}M` } },
  };

  // BIỂU ĐỒ TRÒN (Donut Chart)
  const orderStatusConfig = {
    data: data?.charts?.orderStatus || [],
    angleField: "total",
    colorField: "status",
    innerRadius: 0.7,
    label: { text: "total", style: { fontWeight: "bold" } },
    legend: { color: { position: "bottom", layout: "horizontal" } },
    scale: { color: { range: ["#10b981", "#f59e0b", "#ef4444"] } },
    annotations: [
      {
        type: "text",
        style: {
          text: "Đơn hàng\nTổng quan",
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 14,
          fontStyle: "bold",
        },
      },
    ],
  };

  return (
    <div
      style={{
        padding: "24px 32px",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
            Báo cáo Kinh doanh
          </Title>
          <Text type="secondary">
            Cập nhật lần cuối: {dayjs().format("HH:mm, DD/MM/YYYY")}
          </Text>
        </div>
        <Button
          size="large"
          icon={<ReloadOutlined />}
          onClick={fetchDashboard}
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng đơn hàng"
            value={data?.overview?.orders}
            icon={<ShoppingCartOutlined />}
            color="#6366f1"
            trend="+12.5%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh thu thực tế"
            value={totalRevenue}
            icon={<DollarOutlined />}
            color="#10b981"
            isMoney
            trend="+8.2%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Khách hàng mới"
            value={data?.overview?.users}
            icon={<UserOutlined />}
            color="#8b5cf6"
            trend="+5.1%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tồn kho thấp"
            value={data?.overview?.lowStock}
            icon={<FireOutlined />}
            color="#f43f5e"
            trend="Cần nhập"
          />
        </Col>
      </Row>

      {/* Main Charts Area */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col lg={16} xs={24}>
          <Card
            title={
              <Space>
                <AreaChartOutlined style={{ color: "#6366f1" }} />{" "}
                <Text strong>Xu hướng doanh thu</Text>
              </Space>
            }
            bordered={false}
            className="card-shadow"
            extra={<Button type="text" icon={<MoreOutlined />} />}
          >
            <Area {...revenueConfig} height={350} />
          </Card>
        </Col>
        <Col lg={8} xs={24}>
          <Card
            title={
              <Space>
                <PieChartOutlined style={{ color: "#f59e0b" }} />{" "}
                <Text strong>Tỉ trọng trạng thái</Text>
              </Space>
            }
            bordered={false}
            className="card-shadow"
          >
            <Pie {...orderStatusConfig} height={350} />
          </Card>
        </Col>
      </Row>

      {/* Latest Orders Table */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: "#10b981" }} />{" "}
            <Text strong>Giao dịch gần đây</Text>
          </Space>
        }
        bordered={false}
        style={{ marginTop: 24 }}
        className="card-shadow"
        bodyStyle={{ padding: "0px 24px" }}
      >
        <Table
          dataSource={data?.tables?.latestOrders || []}
          columns={orderColumns}
          pagination={false}
          rowKey="id"
          className="custom-table"
        />
        <div style={{ textAlign: "center", padding: "16px" }}>
          <Button
            type="link"
            onClick={() => navigate("/orders")} // Sử dụng navigate thay vì navigation
            style={{ fontWeight: 600 }}
          >
            Xem tất cả đơn hàng
          </Button>
        </div>
      </Card>

      <style>{`
        .card-shadow { box-shadow: 0 4px 20px rgba(0,0,0,0.03); border-radius: 16px; transition: 0.3s; }
        .card-shadow:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
        .custom-table .ant-table-thead > tr > th { background: transparent; border-bottom: 2px solid #f1f5f9; font-weight: 700; color: #64748b; }
        .custom-table .ant-table-tbody > tr > td { padding: 16px 8px; }
      `}</style>
    </div>
  );
}

/* --- Components phụ trợ --- */

const StatCard = ({ title, value = 0, icon, color, isMoney, trend }) => (
  <Card bordered={false} className="card-shadow">
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Space direction="vertical" size={0}>
        <Text
          type="secondary"
          strong
          style={{
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
        <div style={{ margin: "8px 0" }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 28 }}>
            {isMoney ? Number(value).toLocaleString("vi-VN") : value}
            {isMoney && <span style={{ fontSize: 16, marginLeft: 4 }}>₫</span>}
          </Title>
        </div>
        <Space
          style={{
            color: trend?.startsWith("+") ? "#10b981" : "#f43f5e",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              background: trend?.startsWith("+") ? "#d1fae5" : "#fee2e2",
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            {trend?.startsWith("+") && <ArrowUpOutlined />} {trend}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            so với tháng trước
          </Text>
        </Space>
      </Space>
      <div
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
          color,
          width: 56,
          height: 56,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

const orderColumns = [
  {
    title: "MÃ ĐƠN",
    dataIndex: "order_code",
    render: (code) => (
      <Space>
        <Avatar
          size="small"
          style={{ background: "#e0e7ff", color: "#4338ca" }}
        >
          #
        </Avatar>
        <Text strong style={{ color: "#1e293b" }}>
          {code}
        </Text>
      </Space>
    ),
  },
  {
    title: "THÀNH TIỀN",
    dataIndex: "final_amount",
    render: (v) => (
      <Text strong style={{ color: "#0f172a" }}>
        {Number(v).toLocaleString("vi-VN")}₫
      </Text>
    ),
  },
  {
    title: "TRẠNG THÁI",
    dataIndex: "status",
    render: (status) => {
      const statusConfig = {
        pending: {
          label: "Chờ xác nhận",
          color: "warning", // Màu cam (Ant Design)
          icon: "●",
          bg: "#fff7ed",
        },
        pending_payment: {
          label: "Chờ thanh toán",
          color: "default", // Màu xám trung tính
          icon: "●",
          bg: "#f8fafc",
        },
        paid: {
          label: "Đã thanh toán",
          color: "cyan", // Màu xanh mạ
          icon: "●",
          bg: "#ecfeff",
        },
        shipping: {
          label: "Đang giao hàng",
          color: "processing", // Màu xanh dương (Primary)
          icon: "●",
          bg: "#eff6ff",
        },
        completed: {
          label: "Hoàn thành",
          color: "success", // Màu xanh lá
          icon: "●",
          bg: "#f0fdf4",
        },
        cancelled: {
          label: "Đã hủy",
          color: "error", // Màu đỏ
          icon: "●",
          bg: "#fef2f2",
        },
      };
      const s = statusConfig[status] || {
        label: status,
        color: "default",
        icon: "●",
      };
      return (
        <Tag
          color={s.color}
          style={{ borderRadius: 20, padding: "2px 12px", fontWeight: 600 }}
        >
          <span style={{ marginRight: 6 }}>{s.icon}</span> {s.label}
        </Tag>
      );
    },
  },
  {
    title: "THỜI GIAN",
    dataIndex: "created_at",
    render: (date) => (
      <Space direction="vertical" size={0}>
        <Text style={{ fontSize: 13 }}>
          {dayjs(date).format("DD MMM, YYYY")}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {dayjs(date).format("HH:mm")}
        </Text>
      </Space>
    ),
  },
];

const centerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f8fafc",
};
