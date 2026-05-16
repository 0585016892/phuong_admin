import React from "react";
import { Layout, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";

const { Content } = Layout;

export default function AdminLayout() {
  return (
    // ConfigProvider giúp đồng bộ font chữ và màu sắc chủ đạo cho toàn bộ hệ thống
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1", // Màu Indigo chủ đạo của Modern Library
          borderRadius: 12,        // Bo góc hiện đại cho mọi component
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
        {/* Sidebar cố định bên trái */}
        <Sidebar />

        <Layout style={{ background: "transparent" }}>
          {/* Header Bar cố định phía trên */}
          <HeaderBar />

          {/* Vùng nội dung chính */}
          <Content style={contentWrapperStyle}>
            <div style={innerContentStyle}>
              {/* ⬇️ Các trang như Dashboard, Products... sẽ render tại đây */}
              <Outlet />
            </div>

            {/* Footer nhỏ gọn bên dưới */}
            <footer style={footerStyle}>
              The Modern Library System ©{new Date().getFullYear()} — Design with Sophistication
            </footer>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

/* ===== Styles (The Modern Library Framework) ===== */

const contentWrapperStyle = {
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  minHeight: "calc(100vh - 64px)", // Trừ đi chiều cao của Header
};

const innerContentStyle = {
  flex: 1, // Đẩy footer xuống dưới cùng
  // Nếu bạn muốn nội dung nằm trong một khối trắng, hãy thêm:
  // background: "#fff",
  // padding: "24px",
  // borderRadius: "16px",
};

const footerStyle = {
  textAlign: "center",
  padding: "24px 0 0 0",
  color: "#94a3b8",
  fontSize: "13px",
  letterSpacing: "0.5px",
};