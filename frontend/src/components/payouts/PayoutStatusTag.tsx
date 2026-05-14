"use client";

import React from "react";
import { Tag } from "antd";
import type { PayoutStatus } from "@/api/payouts.api";

interface PayoutStatusTagProps {
  status: PayoutStatus;
}

const STATUS_CONFIG: Record<PayoutStatus, { color: string; label: string }> = {
  pending: { color: "warning", label: "Đang chờ" },
  processing: { color: "processing", label: "Đang xử lý" },
  paid: { color: "success", label: "Đã thanh toán" },
  failed: { color: "error", label: "Thất bại" },
};

export function PayoutStatusTag({ status }: PayoutStatusTagProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <Tag color={config.color} className="rounded-full px-3 uppercase text-[10px] font-bold">
      {config.label}
    </Tag>
  );
}
