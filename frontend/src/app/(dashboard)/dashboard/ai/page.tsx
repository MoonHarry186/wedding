"use client";

import React from "react";
import { Tabs, Typography, Breadcrumb, Card } from "antd";
import {
  RiRobot2Line,
  RiKey2Line,
  RiMagicLine,
  RiImageAddLine,
  RiBracesLine,
  RiHistoryLine,
} from "@remixicon/react";
import { AIConfigTab } from "@/components/ai/AIConfigTab";
import { GenerateTemplateTab } from "@/components/ai/GenerateTemplateTab";
import { GenerateImageTab } from "@/components/ai/GenerateImageTab";
import { ExtractVariablesTab } from "@/components/ai/ExtractVariablesTab";
import { AIUsageLogTable } from "@/components/ai/AIUsageLogTable";

const { Title, Text } = Typography;

export default function AIPage() {
  return (
    <div className="pt-6 px-6 pb-6 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Trợ lý AI" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Cinlove AI Assistant
          </Title>
          <Text type="secondary">
            Sử dụng trí tuệ nhân tạo để tăng tốc quy trình thiết kế và quản lý dữ liệu thiệp mời.
          </Text>
        </div>
        <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
          <RiRobot2Line className="text-primary" size={24} />
          <div>
            <Text strong className="text-xs block leading-tight">AI Status</Text>
            <Text className="text-[11px] text-green-600 font-bold uppercase tracking-widest">Ready to assist</Text>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant min-h-[700px]"
      >
        <Tabs
          defaultActiveKey="generate-template"
          className="ai-tabs"
          items={[
            {
              key: "generate-template",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <RiMagicLine size={18} />
                  <span>Generate Template</span>
                </div>
              ),
              children: <GenerateTemplateTab />,
            },
            {
              key: "generate-image",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <RiImageAddLine size={18} />
                  <span>AI Image</span>
                </div>
              ),
              children: <GenerateImageTab />,
            },
            {
              key: "extract-vars",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <RiBracesLine size={18} />
                  <span>Extract Variables</span>
                </div>
              ),
              children: <ExtractVariablesTab />,
            },
            {
              key: "config",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <RiKey2Line size={18} />
                  <span>BYOK Config</span>
                </div>
              ),
              children: <AIConfigTab />,
            },
            {
              key: "logs",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <RiHistoryLine size={18} />
                  <span>Usage History</span>
                </div>
              ),
              children: <AIUsageLogTable />,
            },
          ]}
        />
      </Card>

      <style jsx global>{`
        .ai-tabs .ant-tabs-nav {
          margin-bottom: 24px !important;
        }
        .ai-tabs .ant-tabs-tab {
          padding: 12px 16px !important;
          border-radius: 12px !important;
          transition: all 0.3s !important;
        }
        .ai-tabs .ant-tabs-tab-active {
          background-color: #f5f3ff !important;
        }
        .ai-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1e1b4b !important;
          font-weight: 700 !important;
        }
        .ai-tabs .ant-tabs-ink-bar {
          background: #1e1b4b !important;
          height: 3px !important;
          border-radius: 3px 3px 0 0 !important;
        }
      `}</style>
    </div>
  );
}
