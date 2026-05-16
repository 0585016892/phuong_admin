import React, { useEffect, useState } from "react";
import {
  Table, Tag, Space, Button, Input, Select, Card, Typography,
  Modal, Descriptions, List, message, Divider, Tooltip, Badge, Row, Col, Statistic, Avatar
} from "antd";
import {
  SearchOutlined, EyeOutlined, ReloadOutlined,
  ShoppingCartOutlined, UserOutlined, CalendarOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DollarCircleOutlined, CarOutlined, BookOutlined, PhoneOutlined, MailOutlined, TagOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getOrders, getOrderDetail, updateOrderStatus } from "../api/orderApi";

const { Title, Text } = Typography;

const STATUS_FLOW = ["pending", "paid", "shipping", "completed"];
const FINAL_STATUSES = ["completed", "cancelled"];

const STATUS_COLOR = {
  pending: { color: "orange", label: "Chờ xử lý", icon: <ClockCircleOutlined /> },
  paid: { color: "blue", label: "Đã thanh toán", icon: <DollarCircleOutlined /> },
  shipping: { color: "cyan", label: "Đang giao", icon: <CarOutlined /> },
  completed: { color: "green", label: "Hoàn thành", icon: <CheckCircleOutlined /> },
  cancelled: { color: "red", label: "Đã hủy", icon: <CloseCircleOutlined /> },
};

export default function Orders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getOrders({ page, limit: pagination.limit, keyword, status });
      const rawResponse = res.data || res;
      const listData = Array.isArray(rawResponse.data) ? rawResponse.data : (Array.isArray(rawResponse) ? rawResponse : []);
      setData(listData);
      setPagination({ ...pagination, page: rawResponse.page || page, total: rawResponse.total || 0 });
    } catch (err) {
      message.error("Không tải được danh sách đơn hàng");
      setData([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(1); }, [keyword, status]);

  const openDetail = async (id) => {
    try {
      setBtnLoading(id);
      const res = await getOrderDetail(id);
      console.log(res);
      
      setDetail(res.data || res);
      setOpen(true);
    } catch { message.error("Lỗi tải chi tiết"); }
    finally { setBtnLoading(false); }
  };

  const changeStatus = async (id, value) => {
    try {
      await updateOrderStatus(id, value);
      message.success("Cập nhật trạng thái thành công");
      if (detail && detail.id === id) setDetail({ ...detail, status: value });
      fetchOrders(pagination.page);
    } catch { message.error("Cập nhật thất bại"); }
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
      render: (text) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: "Khách Hàng",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.customer_name || "N/A"}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>{r.customer_phone}</Text>
        </Space>
      ),
    },
    {
      title: "Thực Thu",
      dataIndex: "final_amount",
      render: (v) => <Text strong style={{ color: '#cf1322' }}>{Number(v || 0).toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      render: (v, r) => (
        <Select
          value={v}
          style={{ width: 150 }}
          bordered={false}
          disabled={FINAL_STATUSES.includes(v)}
          onChange={(value) => changeStatus(r.id, value)}
        >
          {Object.entries(STATUS_COLOR).map(([key, config]) => (
            <Select.Option key={key} value={key} disabled={isStatusDisabled(v, key)}>
              <Tag icon={config.icon} color={config.color} style={{ border: 'none', borderRadius: 12 }}>
                {config.label}
              </Tag>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Ngày Đặt",
      dataIndex: "created_at",
      render: (v) => <Text type="secondary">{dayjs(v).format("DD/MM/YYYY HH:mm")}</Text>,
    },
    {
      title: "",
      align: 'right',
      render: (_, r) => (
        <Button type="primary" ghost icon={<EyeOutlined />} loading={btnLoading === r.id} onClick={() => openDetail(r.id)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7f9', minHeight: '100vh' }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col span={12}><Title level={2} style={{ margin: 0 }}>📦 Quản lý Đơn Hàng</Title></Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button size="large" icon={<ReloadOutlined />} onClick={() => fetchOrders(pagination.page)}>Làm mới</Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Tổng Đơn" value={pagination.total} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Đang Chờ" value={data.filter(i => i.status === 'pending').length} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Hoàn Thành" value={data.filter(i => i.status === 'completed').length} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic 
              title="Doanh Thu Thực" 
              value={data.filter(i => i.status === 'completed').reduce((sum, i) => sum + Number(i.final_amount), 0)} 
              suffix="₫" 
              valueStyle={{ color: '#52c41a' }} 
            />          
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space size="large">
          <Input.Search placeholder="Tìm mã đơn, tên khách..." allowClear onSearch={() => fetchOrders(1)} onChange={e => setKeyword(e.target.value)} style={{ width: 350 }} size="large" />
          <Select size="large" placeholder="Trạng thái" allowClear style={{ width: 200 }} onChange={setStatus}>
            {Object.entries(STATUS_COLOR).map(([key, config]) => <Select.Option key={key} value={key}>{config.label}</Select.Option>)}
          </Select>
        </Space>
      </Card>

      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ current: pagination.page, total: pagination.total, pageSize: pagination.limit, onChange: fetchOrders }} />

      <Modal
        open={open} width={1000} centered onCancel={() => setOpen(false)}
        footer={[<Button key="close" type="primary" onClick={() => setOpen(false)}>Đóng</Button>]}
        title={<Space><ShoppingCartOutlined /><span>Chi tiết vận đơn: {detail?.order_code}</span></Space>}
      >
        {detail && (
          <Row gutter={24}>
            <Col span={15}>
              <Divider orientation="left">Thông tin khách hàng</Divider>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label={<><UserOutlined /> Tên</>}>{detail.order.customer_name}</Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> SĐT</>}>{detail.order.customer_phone}</Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>} span={2}>{detail.order.customer_email}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú khách" span={2}>
                   <Text italic type={detail.order.status === 'cancelled' ? 'danger' : 'secondary'}>
                     {detail.order.note || "Không có ghi chú"}
                   </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Hình thức thanh toán" span={2}>
                   <Text italic type={detail.order.payment === 'cancelled' ? 'danger' : 'secondary'}>
                     {detail.order.payment || "Đang cập nhật..."}
                   </Text>
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Sản phẩm đặt mua</Divider>
              <List
                dataSource={detail.items || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar shape="square" size={48} icon={<BookOutlined />} />}
                      title={<Text strong>{item.product_name}</Text>}
                      description={`${item.quantity} x ${Number(item.price).toLocaleString('vi-VN')} ₫`}
                    />
                    <Text strong>{Number(item.total).toLocaleString('vi-VN')} ₫</Text>
                  </List.Item>
                )}
              />
            </Col>

            <Col span={9}>
              <Divider orientation="left">Thanh toán</Divider>
              <Card type="inner" style={{ background: '#f8fafc' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tổng cộng">{Number(detail.order.total_amount).toLocaleString('vi-VN')} ₫</Descriptions.Item>
                  <Descriptions.Item label="Giảm giá">
                    <Text type="danger">-{Number(detail.order.discount_amount).toLocaleString('vi-VN')} ₫</Text>
                  </Descriptions.Item>
                  {detail.order.coupon_code && (
                    <Descriptions.Item label={<><TagOutlined /> Mã giảm giá</>}>
                      <Tag color="magenta">{detail.order.coupon_code}</Tag>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={<Text strong>Thực thu</Text>}>
                    <Text strong style={{ fontSize: 18, color: '#cf1322' }}>{Number(detail.order.final_amount).toLocaleString('vi-VN')} ₫</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Divider orientation="left">Trạng thái vận đơn</Divider>
              <Select 
                style={{ width: '100%' }} 
                value={detail.order.status}
                disabled={FINAL_STATUSES.includes(detail.order.status)}
                onChange={(v) => changeStatus(detail.order.id, v)}
              >
                {Object.entries(STATUS_COLOR).map(([key, config]) => (
                  <Select.Option key={key} value={key} disabled={isStatusDisabled(detail.order.status, key)}>
                    {config.label}
                  </Select.Option>
                ))}
              </Select>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CalendarOutlined /> Đặt lúc: {dayjs(detail.order.created_at).format("HH:mm DD/MM/YYYY")}
                </Text>
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      <style jsx>{`
        .stat-card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        :global(.ant-table) { background: white; border-radius: 12px; overflow: hidden; }
      `}</style>
    </div>
  );
}