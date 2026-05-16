import React from "react";
import { Menu, Layout, Typography, Divider } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  UserOutlined,
  GiftOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Categories from "../pages/Categories";

const { Sider } = Layout;
const { Title } = Typography;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined style={iconStyle} />,
      label: "Tổng quan",
    },
    {
      type: 'group',
      label: 'QUẢN LÝ KHO',
      children: [
        {
          key: "/products",
          icon: <BookOutlined style={iconStyle} />,
          label: "Sách trong kho",
        },
        {
          key: "/orders",
          icon: <ShoppingCartOutlined style={iconStyle} />,
          label: "Đơn hàng",
        },
      ]
    },
    {
      type: 'group',
      label: 'HỆ THỐNG',
      children: [
        {
          key: "/users",
          icon: <UserOutlined style={iconStyle} />,
          label: "Người dùng",
        },
        {
          key: "/coupons",
          icon: <GiftOutlined style={iconStyle} />,
          label: "Mã giảm giá",
        },
        {
          key: "/categories",
          icon: <GiftOutlined style={iconStyle} />,
          label: "Danh mục",
        },
      ]
    }
  ];

  return (
    <Sider
      width={260}
      theme="light"
      style={siderStyle}
    >
      {/* Logo Area */}
      <div style={logoContainerStyle}>
        <div style={logoBoxStyle}>
          <ReadOutlined style={{ color: "#fff", fontSize: 20 }} />
        </div>
        <Title level={4} style={logoTextStyle}>
          BOOK <span style={{ color: "#6366f1" }}>ADMIN</span>
        </Title>
      </div>

      <Divider style={{ margin: "10px 0" }} />

      {/* Main Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
        style={menuStyle}
      />

      {/* Bottom Card (Optional) */}
      <div style={bottomInfoStyle}>
        <div style={infoBoxStyle}>
          <small style={{ color: "#64748b" }}>Phiên bản 2.0</small>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Modern Library UI</div>
        </div>
      </div>
    </Sider>
  );
}

/* ===== Styles (Modern Library UI) ===== */

const siderStyle = {
  background: "#ffffff",
  borderRight: "1px solid #f1f5f9",
  height: "100vh",
  position: "sticky",
  top: 0,
  left: 0,
};

const logoContainerStyle = {
  padding: "24px 20px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoBoxStyle = {
  width: 36,
  height: 36,
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  borderRadius: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
};

const logoTextStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 800,
  letterSpacing: "0.5px",
};

const menuStyle = {
  borderRight: "none",
  padding: "0 12px",
};

const iconStyle = {
  fontSize: "18px",
};

const bottomInfoStyle = {
  position: "absolute",
  bottom: 20,
  width: "100%",
  padding: "0 20px",
};

const infoBoxStyle = {
  background: "#f8fafc",
  padding: "16px",
  borderRadius: "12px",
  textAlign: "center",
  border: "1px solid #f1f5f9",
};  