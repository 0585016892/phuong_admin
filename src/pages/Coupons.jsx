import React, { useEffect, useState } from "react";
import {
  Table, Button, Space, Tag, Modal, Form, Input, InputNumber,
  Select, DatePicker, message, Card, Typography, Tooltip,
  Divider, Badge, Row, Col
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, CalendarOutlined, InfoCircleOutlined,
  DollarCircleOutlined, NumberOutlined, FireOutlined,
  ThunderboltOutlined, CheckCircleOutlined, StopOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../api/couponApi";

const { Title, Text } = Typography;

export default function Coupons() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: "", status: undefined });
  const [form] = Form.useForm();
  const discountType = Form.useWatch("discount_type", form);

  /* ================= FETCH ================= */
  const fetchData = async (page = pagination.page) => {
    try {
      setLoading(true);
      const res = await getCoupons({ page, limit: pagination.limit, ...filters });
      setData(res.data.data);
      setPagination({ ...pagination, page, total: res.total });
    } catch {
      message.error("Không tải được dữ liệu coupon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [filters]);

  /* ================= LOGIC STATUS ================= */
  const getCouponStatus = (coupon) => {
    const isExpired = coupon.expired_at && dayjs().isAfter(dayjs(coupon.expired_at).endOf("day"));
    const isOutOfStock = coupon.quantity <= 0;
    const isDisabled = coupon.status === 0;

    if (isDisabled) return <Tag icon={<StopOutlined />} color="default">Vô hiệu hóa</Tag>;
    if (isExpired) return <Tag icon={<InfoCircleOutlined />} color="error">Hết hạn</Tag>;
    if (isOutOfStock) return <Tag icon={<FireOutlined />} color="warning">Hết lượt</Tag>;
    return <Tag icon={<CheckCircleOutlined />} color="success">Đang chạy</Tag>;
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        code: values.code.toUpperCase(),
        expired_at: values.expired_at ? values.expired_at.format("YYYY-MM-DD") : null,
      };
      if (editing) {
        await updateCoupon(editing.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await createCoupon(payload);
        message.success("Tạo mới thành công");
      }
      setOpen(false);
      fetchData();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Mã Ưu Đãi",
      key: "code",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
            padding: "4px 12px",
            borderRadius: "6px",
            color: "white",
            fontWeight: "bold",
            letterSpacing: "1px",
            fontSize: "13px",
            boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)"
          }}>
            {r.code}
          </div>
          <Text type="secondary" style={{ fontSize: "11px" }}>ID: #{r.id}</Text>
        </Space>
      ),
    },
    {
      title: "Cơ Chế Giảm Giá",
      render: (_, r) => (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 600, color: "#10b981", fontSize: "15px" }}>
            {r.discount_type === "percent" ? (
              <><ThunderboltOutlined /> Giảm {r.discount_value}%</>
            ) : (
              <><DollarCircleOutlined /> Giảm {r.discount_value?.toLocaleString()} ₫</>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {r.min_order_value ? `Đơn từ: ${r.min_order_value.toLocaleString()} ₫` : "Mọi đơn hàng"}
          </Text>
        </div>
      ),
    },
    {
      title: "Sử dụng",
      align: "center",
      render: (_, r) => (
        <Tooltip title={`Còn lại ${r.quantity} lượt dùng`}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{r.quantity}</div>
            <Text type="secondary" style={{ fontSize: "10px" }}>LƯỢT</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Thời Hạn",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Tag icon={<CalendarOutlined />} style={{ margin: 0, border: "none", background: "#f1f5f9" }}>
            {r.expired_at ? dayjs(r.expired_at).format("DD/MM/YYYY") : "Vô hạn"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Trạng Thái",
      align: "center",
      render: (_, r) => getCouponStatus(r),
    },
    {
      title: "Thao tác",
      align: "right",
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            ghost
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(r);
              form.setFieldsValue({ ...r, expired_at: r.expired_at ? dayjs(r.expired_at) : null });
              setOpen(true);
            }}
          />
          <Button
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => Modal.confirm({
              title: "Xác nhận xoá?",
              content: `Mã ${r.code} sẽ không thể khôi phục.`,
              okText: "Xoá ngay",
              okType: "danger",
              cancelText: "Hủy",
              onOk: () => deleteCoupon(r.id).then(fetchData),
            })}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Khuyến mãi</Title>
          <Text type="secondary">Tạo và tối ưu hóa các mã giảm giá cho cửa hàng của bạn</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ borderRadius: "8px", height: "45px", fontWeight: 500 }}
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}
        >
          Thêm mã mới
        </Button>
      </div>

      {/* FILTER SECTION */}
      <Card bordered={false} style={{ marginBottom: "16px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm mã hoặc tên chiến dịch..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              allowClear
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc trạng thái"
              style={{ width: "100%" }}
              allowClear
              onChange={(v) => setFilters({ ...filters, status: v })}
              options={[
                { label: "Hoạt động", value: 1 },
                { label: "Tạm tắt", value: 0 },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* TABLE SECTION */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (p) => fetchData(p),
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal
        open={open}
        title={
          <div style={{ paddingBottom: "10px" }}>
            <Title level={4} style={{ margin: 0 }}>{editing ? "Chỉnh sửa mã" : "Thêm mã giảm giá mới"}</Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>Điền thông tin chi tiết cho chương trình ưu đãi</Text>
          </div>
        }
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editing ? "Lưu thay đổi" : "Tạo ngay"}
        centered
      >
        <Divider style={{ marginTop: 0 }} />
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Mã Coupon" rules={[{ required: true, message: "Nhập mã" }]}>
                <Input placeholder="Ví dụ: SUMMER2024" style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue={1}>
                <Select options={[{ label: "Hoạt động", value: 1 }, { label: "Tạm tắt", value: 0 }]} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="discount_type" label="Loại hình giảm giá" initialValue="percent">
                <Select options={[{ label: "Theo phần trăm (%)", value: "percent" }, { label: "Số tiền cố định (₫)", value: "fixed" }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discount_value" label="Giá trị giảm" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  max={discountType === "percent" ? 100 : undefined}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="min_order_value" label="Giá trị đơn tối thiểu">
                <InputNumber style={{ width: "100%" }} step={1000} addonAfter="₫" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_discount" label="Mức giảm tối đa">
                <InputNumber style={{ width: "100%" }} step={1000} addonAfter="₫" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="quantity" label="Tổng số lượt sử dụng" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={1} prefix={<NumberOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expired_at" label="Ngày hết hạn">
                <DatePicker style={{ width: "100%" }} placeholder="Chọn ngày" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}