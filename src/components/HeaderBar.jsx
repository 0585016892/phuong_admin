import React, { useState } from "react";
import { 
  Layout, Dropdown, Avatar, Space, Typography, 
  Button, Modal, List, Badge, Divider, Tag, Tabs, Popover, Row, Col, Card, Steps, Alert
} from "antd";
import { 
  UserOutlined, LogoutOutlined, BellOutlined, 
  QuestionCircleOutlined, DashboardOutlined,
  BookOutlined, ShoppingCartOutlined, GiftOutlined, InfoCircleOutlined,
  CheckCircleOutlined, WarningOutlined, RocketOutlined, SafetyCertificateOutlined,
  ArrowRightOutlined, AppstoreOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text, Title, Paragraph } = Typography;

export default function HeaderBar() {
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 1. Dữ liệu thông báo (Popover)
  const notifications = [
    { id: 1, title: "Đơn hàng mới", desc: "Mã đơn #OD1002 cần xác nhận", time: "2 phút trước", type: "info" },
    { id: 2, title: "Cảnh báo kho", desc: "Sách 'Clean Code' còn dưới 5 cuốn", time: "1 giờ trước", type: "warning" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Thông báo mới nhất</Text>
        <Badge status="processing" text="Mới" />
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item className="noti-hover-item" style={{ padding: '12px', cursor: 'pointer' }}>
            <List.Item.Meta
              avatar={
                item.type === 'warning' ? <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} /> :
                <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              }
              title={<Text strong style={{ fontSize: 13 }}>{item.title}</Text>}
              description={<Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>}
            />
          </List.Item>
        )}
      />
      <Button type="link" block style={{ borderTop: '1px solid #f0f0f0', borderRadius: 0 }}>Xem tất cả</Button>
    </div>
  );

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
    { key: "logout", icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />, label: <span style={{ color: "#ff4d4f" }}>Đăng xuất</span>, onClick: handleLogout },
  ];

  return (
    <Header style={headerStyle}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={logoIconBox}>
          <RocketOutlined style={{ color: '#fff' }} />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 10 }}>Management System</Text>
        </div>
      </div>

      <Space size={16}>
        <Button 
          type="text" 
          icon={<QuestionCircleOutlined style={iconStyle} />} 
          onClick={() => setIsGuideOpen(true)}
        >
          Hướng dẫn
        </Button>

        <Popover content={notificationContent} trigger="click" placement="bottomRight" overlayInnerStyle={{ padding: 0 }}>
          <Badge count={notifications.length} size="small">
            <Button type="text" icon={<BellOutlined style={iconStyle} />} />
          </Badge>
        </Popover>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={userProfileStyle}>
            <div style={userInfoStyle}>
              <Text strong style={{ display: 'block', fontSize: 13 }}>Admin</Text>
              <Tag color="green" style={{ fontSize: 10, margin: 0, borderRadius: 10 }}>Trực tuyến</Tag>
            </div>
            <Avatar size="large" icon={<UserOutlined />} style={{ background: '#6366f1' }} />
          </div>
        </Dropdown>
      </Space>

      {/* MODAL HƯỚNG DẪN CHI TIẾT (PREMIUM VERSION) */}
      <Modal
        title={
          <div style={{ paddingBottom: 10 }}>
            <Title level={4} style={{ margin: 0 }}><InfoCircleOutlined style={{ color: '#1677ff' }} /> Trung tâm hướng dẫn Admin</Title>
            <Text type="secondary">Làm chủ hệ thống quản lý kho sách chuyên nghiệp</Text>
          </div>
        }
        open={isGuideOpen}
        onCancel={() => setIsGuideOpen(false)}
        width={850}
        centered
        footer={[<Button key="ok" type="primary" size="large" onClick={() => setIsGuideOpen(false)} style={{ borderRadius: 8 }}>Đã hiểu quy trình</Button>]}
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[
            {
              key: '1',
              label: <Space><AppstoreOutlined />Tổng quan</Space>,
              children: (
                <div style={tabContentStyle}>
                  <Alert message="Mẹo: Theo dõi biểu đồ doanh thu mỗi sáng để nắm bắt xu hướng mua sắm của khách hàng." type="info" showIcon style={{ marginBottom: 20 }} />
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card size="small" title={<Text strong><DashboardOutlined /> Dashboard</Text>} bordered={false} style={guideCardInner}>
                        <Paragraph type="secondary">Hiển thị thống kê tổng doanh thu, số lượng đơn hàng và sách bán chạy nhất theo thời gian thực.</Paragraph>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" title={<Text strong><SafetyCertificateOutlined /> Bảo mật</Text>} bordered={false} style={guideCardInner}>
                        <Paragraph type="secondary">Tất cả giao dịch và dữ liệu khách hàng được mã hóa. Đảm bảo không chia sẻ tài khoản Admin.</Paragraph>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: '2',
              label: <Space><ShoppingCartOutlined />Vận hành Kho & Đơn</Space>,
              children: (
                <div style={tabContentStyle}>
                  <Title level={5} style={{ marginBottom: 20 }}>Quy trình xử lý đơn hàng chuẩn:</Title>
                  <Steps
                    size="small"
                    current={1}
                    items={[
                      { title: 'Tiếp nhận', description: 'Đơn mới từ web' },
                      { title: 'Xác nhận', description: 'Kiểm kho & Gọi điện' },
                      { title: 'Đóng gói', description: 'Giao cho vận chuyển' },
                      { title: 'Thành công', description: 'Khách đã nhận hàng' },
                    ]}
                  />
                  <Divider />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong><BookOutlined /> Quản lý kho:</Text>
                      <Paragraph style={{ marginTop: 8 }}>Luôn kiểm tra <b>Stock</b> trước khi chạy chiến dịch marketing. Khi xóa sách, dữ liệu đơn hàng cũ vẫn được giữ nguyên.</Paragraph>
                    </Col>
                    <Col span={12}>
                      <Text strong><ShoppingCartOutlined /> Xử lý đơn:</Text>
                      <Paragraph style={{ marginTop: 8 }}>Trạng thái "Đã hủy" sẽ tự động hoàn lại số lượng sách vào kho cho sản phẩm đó.</Paragraph>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: '3',
              label: <Space><GiftOutlined />Hệ thống & Voucher</Space>,
              children: (
                <div style={tabContentStyle}>
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      { icon: <GiftOutlined style={{color: '#eb2f96'}} />, title: "Mã giảm giá", desc: "Tạo Voucher theo % hoặc số tiền cố định. Có thể giới hạn số lượng sử dụng." },
                      { icon: <UserOutlined style={{color: '#13c2c2'}} />, title: "Phân quyền", desc: "Quản lý nhân viên vận hành và danh sách khách hàng thân thiết." },
                      { icon: <AppstoreOutlined style={{color: '#722ed1'}} />, title: "Danh mục", desc: "Phân loại sách (Kinh tế, Kỹ năng...) giúp khách hàng tìm kiếm dễ hơn." }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: '#f5f5f5' }} icon={item.icon} />}
                          title={<Text strong>{item.title}</Text>}
                          description={item.desc}
                        />
                        <Button type="link" icon={<ArrowRightOutlined />} />
                      </List.Item>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .noti-hover-item:hover { background: #f0f7ff; transition: 0.3s; }
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active { background: #fff !important; border-bottom-color: #fff !important; }
        .ant-modal-content { border-radius: 12px !important; overflow: hidden; }
      `}} />
    </Header>
  );
}

/* ===== Styles Cấu trúc ===== */
const headerStyle = {
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  height: "64px",
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  borderBottom: "1px solid #f0f0f0"
};

const logoIconBox = {
  width: 36,
  height: 36,
  background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
  borderRadius: "10px",
  display: "grid",
  placeItems: "center",
  boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)"
};

const userProfileStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "4px 8px",
  borderRadius: "12px",
  cursor: "pointer",
  background: "#f8fafc",
  border: "1px solid #f1f5f9"
};

const userInfoStyle = {
  textAlign: "right",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end"
};

const iconStyle = {
  fontSize: "17px",
  color: "#64748b",
};

const tabContentStyle = {
  padding: '20px 10px',
  minHeight: '300px'
};

const guideCardInner = {
  background: '#f8fafc',
  borderRadius: '12px',
  height: '100%'
};