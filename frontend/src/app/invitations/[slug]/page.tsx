'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Spin, Result, Button } from 'antd';
import { useInvitationBySlug } from '@/hooks/useInvitations';
import { ScaledCanvasPreviewRenderer } from '@/components/invitations/ScaledCanvasPreviewRenderer';
import type { CanvasData } from '@/types/editor';

export default function PublicInvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const token = searchParams.get('token') || '';

  const { data: invitation, isLoading, error } = useInvitationBySlug(slug, token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <Spin size="large" />
          <p className="text-secondary font-serif italic text-lg">Đang mở thiệp mời...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <Result
          status="404"
          title="Không tìm thấy thiệp mời"
          subTitle="Xin lỗi, đường dẫn này không tồn tại hoặc đã hết hạn."
          extra={<Button type="primary" href="/">Về trang chủ</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <div className="mx-auto max-w-3xl">
        {invitation.canvasData && (
          <ScaledCanvasPreviewRenderer
            canvasData={invitation.canvasData as CanvasData}
            variableValues={
              invitation.variableValues as Record<
                string,
                string | number | boolean | Record<string, unknown>
              >
            }
          />
        )}
      </div>
    </div>
  );
}
