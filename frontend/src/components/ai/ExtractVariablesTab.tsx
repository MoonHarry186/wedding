"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Typography,
  Card,
  Tag,
  Empty,
  App,
  Spin,
} from "antd";
import {
  RiBracesLine,
  RiFileCopyLine,
  RiSearchEyeLine,
} from "@remixicon/react";
import { useExtractVariables } from "@/hooks/useAI";

const { Text, Title } = Typography;

export function ExtractVariablesTab() {
  const { message } = App.useApp();
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const extract = useExtractVariables();

  const handleExtract = async () => {
    if (!content.trim()) return;
    try {
      const data = await extract.mutateAsync(content);
      setVariables(data.variables);
      if (data.variables.length > 0) {
        message.success(`Đã tìm thấy ${data.variables.length} biến!`);
      } else {
        message.warning("Không tìm thấy biến nào trong nội dung này.");
      }
    } catch {
      message.error("Lỗi khi trích xuất biến. Vui lòng thử lại.");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(`{{${text}}}`);
      message.success(`Đã sao chép {{${text}}}`);
    } catch {
      message.error("Không thể sao chép.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
      <div className="space-y-6">
        <div>
          <Title level={4} className="!mb-1">Variable Extractor</Title>
          <Text type="secondary">
            Dán nội dung JSON hoặc văn bản để AI trích xuất các biến dữ liệu cần thiết.
          </Text>
        </div>

        <Card variant="outlined" className="shadow-sm border-outline-variant">
          <Input.TextArea
            placeholder='vd: {"customer_name": "Nguyen Van A", "wedding_date": "2024-12-30"}'
            rows={10}
            className="rounded-xl mb-4 font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            type="primary"
            block
            size="large"
            icon={<RiSearchEyeLine size={20} />}
            className="rounded-xl h-12 font-semibold shadow-lg shadow-primary/20"
            onClick={handleExtract}
            loading={extract.isPending}
            disabled={!content.trim()}
          >
            Trích xuất biến
          </Button>
        </Card>
      </div>

      <div className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 bg-white border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RiBracesLine size={18} className="text-primary" />
            <Text strong>Danh sách biến tìm thấy</Text>
          </div>
        </div>

        <div className="flex-1 p-8">
          {extract.isPending ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Spin size="large" />
              <Text className="text-primary font-medium">AI đang phân tích nội dung...</Text>
            </div>
          ) : variables.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {variables.map((v) => (
                <div
                  key={v}
                  className="group bg-white border border-outline-variant rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  onClick={() => copyToClipboard(v)}
                >
                  <Text strong className="font-mono text-indigo-700">
                    {"{{"} {v} {"}}"}
                  </Text>
                  <RiFileCopyLine
                    size={16}
                    className="text-on-surface-variant group-hover:text-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary">
                    Dán nội dung vào ô bên trái để trích xuất các biến tag
                  </Text>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
