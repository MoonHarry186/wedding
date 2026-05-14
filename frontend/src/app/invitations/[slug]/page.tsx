'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Spin, Result, Button } from 'antd';
import { useInvitationBySlug } from '@/hooks/useInvitations';
import { ResponsiveInvitationRenderer } from '@/components/invitations/ResponsiveInvitationRenderer';
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
    <div className="min-h-screen bg-[#fdfaf6] py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="relative">
          {invitation.canvasData && (
            <ResponsiveInvitationRenderer
              canvasData={invitation.canvasData as CanvasData}
              variableValues={invitation.variableValues as Record<string, string | number>} 
            />
          )}
        </div>
        
        {/* RSVP or Actions Bar (Optional Design) */}
        <div className="mt-12 text-center">
          <p className="text-secondary font-serif italic text-xl mb-6">
            Rất mong được đón tiếp bạn!
          </p>
          <Button 
            type="primary" 
            size="large" 
            className="rounded-full px-12 h-14 text-lg bg-primary hover:scale-105 transition-transform"
          >
            Phản hồi (RSVP)
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-20 text-center opacity-40 grayscale hover:grayscale-0 transition-all">
        <p className="text-sm font-serif">Designed with Cinlove</p>
      </div>
    </div>
  );
}
