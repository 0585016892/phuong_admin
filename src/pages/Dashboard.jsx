import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Spin, Empty, Table, Tag } from "antd";
import { 
  BarChartOutlined, ShoppingOutlined, DollarOutlined, 
  UserOutlined, FireOutlined, HistoryOutlined, PieChartOutlined 
} from "@ant-design/icons";
import { Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { dashboardApi } from "../api/dashboardApi";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getStats();
        setData(res.data);
      } catch (err) {
        console.error("DASHBOARD_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div style={centerStyle}><Spin size="large" tip="Đang tải dữ liệu..." /></div>
  );
  
  if (!data) return <Empty style={{ marginTop: 100 }} description="Không có dữ liệu" />;

  // Tính doanh thu thực tế
  const totalRevenue = data.tables?.latestOrders?.reduce((sum, order) => sum + parseFloat(order.final_amount), 0) || 0;

  // CẤU HÌNH BIỂU ĐỒ CỘT (V2)
  const revenueConfig = {
    data: data?.charts?.dailyRevenue || [],
    xField: "date",
    yField: "revenue",
    colorField: "#6366f1",
    label: {
      text: (d) => `${Number(d.revenue).toLocaleString()}₫`,
      style: {
        fill: '#fff',
        opacity: 0.8,
      },
    },
    axis: {
      y: { labelFormatter: (v) => `${Number(v) / 1000}k` },
    },
    tooltip: {
      title: 'date',
      items: [{ channel: 'y', name: 'Doanh thu', valueFormatter: (v) => `${Number(v).toLocaleString()}₫` }],
    },
  };

  // CẤU HÌNH BIỂU ĐỒ TRÒN (V2)
  const orderStatusConfig = {
    data: data?.charts?.orderStatus || [],
    angleField: "total",
    colorField: "status",
    innerRadius: 0.6,
    label: {
      text: "total",
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'bottom',
        rowPadding: 5,
        labelFormatter: (v) => {
          const labels = { completed: 'Hoàn thành', pending: 'Chờ xử lý', cancelled: 'Đã hủy' };
          return labels[v] || v;
        },
      },
    },
    scale: {
      color: {
        range: ['#10b981', '#f59e0b', '#ef4444'], // Green, Orange, Red
      },
    },
  };

  return (
    <div style={{ padding: "32px", background: "#f8fafc", minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 32 }}>Báo cáo tổng quan</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Tổng đơn hàng" value={data?.overview?.orders} icon={<ShoppingOutlined />} color="#6366f1" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Tổng doanh thu" value={totalRevenue} icon={<DollarOutlined />} color="#10b981" isMoney />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Người dùng" value={data?.overview?.users} icon={<UserOutlined />} color="#8b5cf6" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Sắp hết hàng" value={data?.overview?.lowStock} icon={<FireOutlined />} color="#ef4444" />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col lg={16} xs={24}>
          <Card title={<><BarChartOutlined /> Doanh thu hàng ngày</>} bordered={false} style={cardStyle}>
            <Column {...revenueConfig} height={350} />
          </Card>
        </Col>
        <Col lg={8} xs={24}>
          <Card title={<><PieChartOutlined /> Trạng thái đơn hàng</>} bordered={false} style={cardStyle}>
            <Pie {...orderStatusConfig} height={350} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col lg={24} xs={24}>
          <Card title={<><HistoryOutlined /> Đơn hàng mới nhất</>} bordered={false} style={cardStyle}>
            <Table 
              dataSource={data?.tables?.latestOrders || []} 
              columns={orderColumns} 
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

/* --- Components phụ trợ --- */

const StatCard = ({ title, value = 0, icon, color, isMoney }) => (
  <Card bordered={false} style={cardStyle}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Text type="secondary">{title}</Text>
        <div style={{ marginTop: 8 }}>
          <Title level={3} style={{ margin: 0 }}>
            {isMoney ? Number(value).toLocaleString('vi-VN') : value}
            {isMoney && <span style={{ fontSize: '14px', marginLeft: 4 }}>₫</span>}
          </Title>
        </div>
      </div>
      <div style={{ background: `${color}15`, color, padding: '12px', borderRadius: '12px', fontSize: '24px' }}>
        {icon}
      </div>
    </div>
  </Card>
);

const orderColumns = [
  { 
    title: "Mã đơn", 
    dataIndex: "order_code", 
    render: (code) => <Text strong style={{ color: '#6366f1' }}>{code}</Text> 
  },
  { 
    title: "Tổng tiền", 
    dataIndex: "final_amount", 
    render: (v) => <Text strong>{Number(v).toLocaleString('vi-VN')}₫</Text> 
  },
  { 
    title: "Trạng thái", 
    dataIndex: "status", 
    render: (status) => {
      const config = {
        'completed': { label: 'Hoàn thành', color: 'green' },
        'pending': { label: 'Chờ xử lý', color: 'orange' },
        'cancelled': { label: 'Đã hủy', color: 'red' }
      };
      const s = config[status] || { label: status, color: 'blue' };
      return <Tag color={s.color}>{s.label}</Tag>
    } 
  },
  {
    title: "Ngày tạo",
    dataIndex: "created_at",
    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
  }
];

const cardStyle = { borderRadius: "12px", border: "1px solid #f0f0f0" };
const centerStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };