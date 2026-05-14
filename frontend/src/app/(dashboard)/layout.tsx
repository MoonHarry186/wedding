'use client';

import React from 'react';
import { Layout } from 'antd';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className="!h-screen !overflow-hidden !bg-background text-on-background">
      <DashboardSidebar />
      <Layout className="!bg-background !flex !flex-col">
        <DashboardTopbar />
        <Content className="!overflow-y-auto !bg-surface flex-1">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
