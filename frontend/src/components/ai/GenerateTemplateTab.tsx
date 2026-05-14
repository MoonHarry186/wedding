"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Typography,
  Card,
  Space,
  Empty,
  App,
  Spin,
} from "antd";
import {
  RiMagicLine,
  RiLayoutLine,
  RiSaveLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { useGenerateTemplate } from "@/hooks/useAI";
import { CanvasRenderer } from "@/components/invitations/CanvasRenderer";
import type { CanvasData } from "@/types/editor";

const { Text, Title } = Typography;

export function GenerateTemplateTab() {
  const { message } = App.useApp();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{
    canvasData: CanvasData;
    title: string;
  } | null>(null);
  const generate = useGenerateTemplate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const data = await generate.mutateAsync({ prompt });
      setResult(data);
      message.success("Đã tạo mẫu thiệp thành công!");
    } catch {
      message.error("Lỗi trong quá trình tạo mẫu. Vui lòng thử lại.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
      {/* Input Side */}
      <div className="space-y-6">
        <div>
          <Title level={4} className="!mb-1">Generate Template</Title>
          <Text type="secondary">
            Mô tả ý tưởng của bạn để AI tạo ra một mẫu thiệp hoàn chỉnh.
          </Text>
        </div>

        <Card variant="outlined" className="shadow-sm border-outline-variant">
          <Input.TextArea
            placeholder="vd: Một mẫu thiệp cưới phong cách tối giản với tông màu kem và hoa sen trắng, phông chữ Serif cổ điển..."
            rows={8}
            className="rounded-xl mb-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            type="primary"
            block
            size="large"
            icon={<RiMagicLine size={20} />}
            className="rounded-xl h-12 font-semibold shadow-lg shadow-primary/20"
            onClick={handleGenerate}
            loading={generate.isPending}
            disabled={!prompt.trim()}
          >
            Tạo mẫu thiệp
          </Button>
        </Card>

        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <div className="flex items-center gap-2 mb-2">
            <RiMagicLine size={16} className="text-primary" />
            <Text strong className="text-xs uppercase tracking-widest">Gợi ý prompt</Text>
          </div>
          <ul className="space-y-2 text-body-sm text-on-surface-variant list-disc pl-4">
            <li className="cursor-pointer hover:text-primary transition-colors" onClick={() => setPrompt("Thiệp cưới phong cách Tropical, nhiều lá xanh và hoa sứ")}>Thiệp cưới phong cách Tropical...</li>
            <li className="cursor-pointer hover:text-primary transition-colors" onClick={() => setPrompt("Thiệp mời tân gia hiện đại, gam màu xám và cam đất")}>Thiệp mời tân gia hiện đại...</li>
          </ul>
        </div>
      </div>

      {/* Preview Side */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 bg-white border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RiLayoutLine size={18} className="text-primary" />
            <Text strong>Xem trước kết quả</Text>
          </div>
          {result && (
            <Button
              type="primary"
              icon={<RiSaveLine size={18} />}
              className="rounded-lg font-semibold"
            >
              Lưu thành Mẫu thiệp
            </Button>
          )}
        </div>

        <div className="flex-1 p-8 flex justify-center items-center overflow-auto">
          {generate.isPending ? (
            <div className="text-center space-y-4">
              <Spin size="large" />
              <Text className="block text-primary font-medium animate-pulse">AI đang thiết kế cho bạn...</Text>
            </div>
          ) : result ? (
            <div className="shadow-2xl scale-[0.8] origin-center">
              <CanvasRenderer canvasData={result.canvasData} variableValues={{}} />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  Kết quả generate sẽ hiển thị ở đây
                </Text>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
