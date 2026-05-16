import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Layout, ConfigProvider } from "antd";
import { UserOutlined, LockOutlined, BookFilled, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text, Link } = Typography;
const { Content } = Layout;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = async (values) => {
    setLoading(true);
    setError("");
    try {
      await login(values);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Thông tin đăng nhập không chính xác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1",
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <Layout style={containerStyle}>
        <div style={backgroundCircle1} />
        <div style={backgroundCircle2} />
        
        <Content style={contentStyle}>
          <Card style={loginCardStyle} bordered={false}>
            {/* Header Section */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={logoWrapper}>
                <BookFilled style={{ fontSize: 32, color: "#fff" }} />
              </div>
              <Title level={2} style={mainTitleStyle}>
                Chào mừng trở lại!
              </Title>
              <Text style={{ color: "#64748b", fontSize: 15 }}>
                Hệ thống quản trị thư viện thông minh
              </Text>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                style={alertStyle}
              />
            )}

            {/* Login Form */}
            <Form
              name="modern_login"
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label={<Text strong style={{ fontSize: 13, color: "#475569" }}>EMAIL</Text>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập Email!" },
                  { type: "email", message: "Email không hợp lệ!" }
                ]}
              >
                <Input 
                  prefix={<UserOutlined style={iconStyle} />} 
                  placeholder="admin@library.com" 
                  style={inputStyle}
                />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Text strong style={{ fontSize: 13, color: "#475569" }}>MẬT KHẨU</Text>
                    <Link style={{ fontSize: 12, fontWeight: 500 }}>Quên mật khẩu?</Link>
                  </div>
                }
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={iconStyle} />}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 32 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<ArrowRightOutlined />}
                  style={buttonStyle}
                >
                  Đăng Nhập Ngay
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Bạn chưa có tài khoản? <Link strong>Yêu cầu cấp quyền</Link>
              </Text>
            </div>
          </Card>
          
          <div style={footerStyle}>
            © 2026 Modern Library System • Version 2.0.4
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

/* ===== Styles (Modern Premium UI) ===== */

const containerStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
};

// Hiệu ứng các vòng tròn mờ ảo ở background (Glassmorphism effect)
const backgroundCircle1 = {
  position: "absolute",
  width: "600px",
  height: "600px",
  background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)",
  top: "-200px",
  right: "-100px",
  borderRadius: "50%",
};

const backgroundCircle2 = {
  position: "absolute",
  width: "500px",
  height: "500px",
  background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0) 70%)",
  bottom: "-150px",
  left: "-100px",
  borderRadius: "50%",
};

const contentStyle = {
  zIndex: 1,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px 20px",
};

const loginCardStyle = {
  width: "100%",
  maxWidth: 440,
  borderRadius: 24,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
  padding: "24px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
};

const logoWrapper = {
  width: 64,
  height: 64,
  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  borderRadius: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
  boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
};

const mainTitleStyle = {
  fontSize: "28px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
  margin: "0 0 8px 0",
  color: "#1e293b",
};

const inputStyle = {
  padding: "12px 16px",
  fontSize: "16px",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  transition: "all 0.3s",
};

const iconStyle = {
  color: "#94a3b8",
  marginRight: 8
};

const buttonStyle = {
  height: 54,
  fontSize: "16px",
  fontWeight: 600,
  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  border: "none",
  display: "flex",
  flexDirection: "row-reverse", // Đưa icon ra sau chữ
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.4)",
};

const alertStyle = {
  marginBottom: 24,
  borderRadius: 12,
  border: "none",
  background: "#fef2f2",
};

const footerStyle = {
  marginTop: 40,
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.5px",
};