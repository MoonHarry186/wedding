"use client";

import React from "react";
import { Drawer, Table, Typography, Descriptions, Divider, Space, Button, Statistic, Row, Col, Empty } from "antd";
import { RiFileList3Line, RiBankCardLine, RiCalendarLine, RiMoneyDollarCircleLine } from "@remixicon/react";
import { usePayoutDetail, usePayoutItems } from "@/hooks/usePayouts";
import { PayoutStatusTag } from "./PayoutStatusTag";

const { Title, Text } = Typography;

interface PayoutDetailDrawerProps {
  payoutId: string | null;
  onClose: () => void;
}

export function PayoutDetailDrawer({ payoutId, onClose }: PayoutDetailDrawerProps) {
  const { data: payout, isLoading: isPayoutLoading } = usePayoutDetail(payoutId || "");
  const { data: items, isLoading: isItemsLoading } = usePayoutItems(payoutId || "");

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (v: string) => <Text className="font-mono text-xs">#{v.slice(0, 8).toUpperCase()}</Text>,
    },
    {
      title: "Giá trị đơn",
      dataIndex: "orderAmount",
      key: "orderAmount",
      render: (v: number) => <Text className="text-xs">{v.toLocaleString()}đ</Text>,
    },
    {
      title: "Hoa hồng",
      dataIndex: "commission",
      key: "commission",
      render: (v: number) => <Text className="text-xs text-error">-{v.toLocaleString()}đ</Text>,
    },
    {
      title: "Thực nhận",
      dataIndex: "netAmount",
      key: "netAmount",
      render: (v: number) => <Text strong className="text-xs text-primary">{v.toLocaleString()}đ</Text>,
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <RiFileList3Line className="text-primary" />
          <span>Chi tiết đợt thanh toán</span>
        </div>
      }
      open={!!payoutId}
      onClose={onClose}
      size="large"
      loading={isPayoutLoading}
    >
      {payout && (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
            <Row gutter={24}>
              <Col span={12}>
                <Statistic
                  title={<Text className="text-xs uppercase tracking-widest text-secondary font-bold">Tổng số tiền</Text>}
                  value={payout.amount}
                  suffix="đ"
                  styles={{ content: { color: "#1e1b4b", fontWeight: 800, fontSize: 32 } }}
                />
              </Col>
              <Col span={12}>
                <div className="flex flex-col items-end">
                  <Text className="text-xs uppercase tracking-widest text-secondary font-bold mb-2">Trạng thái</Text>
                  <PayoutStatusTag status={payout.status} />
                </div>
              </Col>
            </Row>
          </div>

          {/* Details */}
          <div>
            <Title level={5} className="!mb-4 flex items-center gap-2">
              <RiBankCardLine size={18} className="text-primary" />
              Thông tin chuyển khoản
            </Title>
            <Descriptions column={2} bordered size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label="Phương thức">{payout.payoutMethod}</Descriptions.Item>
              <Descriptions.Item label="Tài khoản">{payout.payoutAccount}</Descriptions.Item>
              <Descriptions.Item label="Mã tham chiếu" span={2}>
                <Text className="font-mono">{payout.referenceId || "---"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(payout.createdAt).toLocaleDateString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xử lý">
                {payout.processedAt ? new Date(payout.processedAt).toLocaleString("vi-VN") : "Đang chờ"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {payout.notes || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <Divider />

          {/* Breakdown Table */}
          <div>
            <Title level={5} className="!mb-4 flex items-center gap-2">
              <RiMoneyDollarCircleLine size={18} className="text-primary" />
              Chi tiết đơn hàng trong đợt này
            </Title>
            <Table
              dataSource={Array.isArray(items) ? items : []}
              columns={columns}
              loading={isItemsLoading}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ 
                emptyText: (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Không có dữ liệu đơn hàng" 
                  />
                ) 
              }}
              className="border border-outline-variant rounded-xl overflow-hidden shadow-sm"
              summary={(pageData) => {
                let totalNet = 0;
                pageData.forEach(({ netAmount }) => (totalNet += netAmount));
                return (
                  <Table.Summary.Row className="bg-surface-container-low font-bold">
                    <Table.Summary.Cell index={0} colSpan={3}>Tổng cộng thực nhận</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong className="text-primary">{totalNet.toLocaleString()}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}
