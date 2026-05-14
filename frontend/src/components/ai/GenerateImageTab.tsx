"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Typography,
  Card,
  Row,
  Col,
  Empty,
  App,
  Spin,
  Select,
} from "antd";
import {
  RiImageAddLine,
  RiDownloadLine,
  RiMagicLine,
} from "@remixicon/react";
import { useGenerateImage } from "@/hooks/useAI";

const { Text, Title } = Typography;

export function GenerateImageTab() {
  const { message } = App.useApp();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const generate = useGenerateImage();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const data = await generate.mutateAsync({
        prompt,
        aspectRatio: aspectRatio as '1:1' | '4:5' | '9:16',
      });
      setImageUrl(data.url);
      message.success("Tạo ảnh thành công!");
    } catch {
      message.error("Lỗi khi tạo ảnh. Vui lòng thử lại.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
      <div className="space-y-6">
        <div>
          <Title level={4} className="!mb-1">AI Image Generator</Title>
          <Text type="secondary">
            Tạo các hình minh họa độc đáo cho mẫu thiệp của bạn.
          </Text>
        </div>

        <Card variant="outlined" className="shadow-sm border-outline-variant">
          <div className="space-y-4">
            <div>
              <Text strong className="text-xs mb-1 block uppercase tracking-wider">Mô tả hình ảnh</Text>
              <Input.TextArea
                placeholder="vd: Một bó hoa hồng pastel phong cách vẽ màu nước trên nền giấy trắng..."
                rows={6}
                className="rounded-xl"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <Text strong className="text-xs mb-1 block uppercase tracking-wider">Tỷ lệ khung hình</Text>
              <Select
                value={aspectRatio}
                onChange={setAspectRatio}
                className="w-full h-11"
                options={[
                  { label: "Hình vuông (1:1)", value: "1:1" },
                  { label: "Chân dung (4:5)", value: "4:5" },
                  { label: "Câu chuyện (9:16)", value: "9:16" },
                ]}
              />
            </div>

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
              Bắt đầu tạo ảnh
            </Button>
          </div>
        </Card>
      </div>

      <div className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 bg-white border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RiImageAddLine size={18} className="text-primary" />
            <Text strong>Kết quả hình ảnh</Text>
          </div>
          {imageUrl && (
            <Button
              type="default"
              icon={<RiDownloadLine size={18} />}
              className="rounded-lg font-semibold"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              Tải ảnh về
            </Button>
          )}
        </div>

        <div className="flex-1 p-8 flex justify-center items-center">
          {generate.isPending ? (
            <div className="text-center space-y-4">
              <Spin size="large" />
              <Text className="block text-primary font-medium">AI đang vẽ ảnh cho bạn...</Text>
            </div>
          ) : imageUrl ? (
            <div className="max-w-2xl w-full">
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white"
              />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  Hình ảnh AI tạo ra sẽ hiển thị ở đây
                </Text>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
