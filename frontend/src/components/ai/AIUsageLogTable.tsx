"use client";

import React from "react";
import { Table, Tag, Typography, Card, Empty } from "antd";
import { RiHistoryLine } from "@remixicon/react";
import { useAIUsageLogs } from "@/hooks/useAI";

const { Text, Title } = Typography;

export function AIUsageLogTable() {
  const { data: logs, isLoading } = useAIUsageLogs();

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => (
        <Text type="secondary" className="text-xs">
          {new Date(v).toLocaleString("vi-VN")}
        </Text>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (v: string) => <Text strong className="capitalize">{v}</Text>,
    },
    {
      title: "Prompt",
      dataIndex: "prompt",
      key: "prompt",
      width: 400,
      render: (v: string) => (
        <Text className="text-xs line-clamp-1" title={v}>
          {v}
        </Text>
      ),
    },
    {
      title: "Tokens",
      dataIndex: "tokens",
      key: "tokens",
      render: (v: number) => <Text className="font-mono text-xs">{v.toLocaleString()}</Text>,
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      render: (v: number) => (
        <Text strong className="text-xs">
          ${v.toFixed(4)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "success" ? "success" : "error"} className="rounded-full px-3 uppercase text-[10px] font-bold">
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <RiHistoryLine size={20} className="text-primary" />
        <Title level={4} className="!mb-0 !font-serif">Lịch sử sử dụng AI</Title>
      </div>

      <Card variant="outlined" className="shadow-sm border-outline-variant overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={logs ?? []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Chưa có lịch sử sử dụng AI" 
              />
            ) 
          }}
        />
      </Card>
    </div>
  );
}
