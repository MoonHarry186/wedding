import axios, { type AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

export interface AppError {
  status: number;
  message: string;
  action: 'toast' | 'redirect' | 'logout' | 'ignore';
  redirectTo?: string;
}

const STATUS_MAP: Record<number, Pick<AppError, 'message' | 'action' | 'redirectTo'>> = {
  400: { message: 'Dữ liệu không hợp lệ', action: 'toast' },
  401: { message: 'Phiên đăng nhập hết hạn', action: 'logout' },
  403: { message: 'Bạn không có quyền truy cập', action: 'redirect', redirectTo: '/403' },
  404: { message: 'Không tìm thấy tài nguyên', action: 'toast' },
  409: { message: 'Dữ liệu đã tồn tại', action: 'toast' },
  429: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau', action: 'toast' },
  500: { message: 'Lỗi hệ thống, vui lòng thử lại', action: 'toast' },
};

export function parseApiError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) {
    return {
      status: 0,
      message: error instanceof Error ? error.message : 'Đã có lỗi không xác định xảy ra',
      action: 'toast',
    };
  }

  const status = error.response?.status ?? 0;
  const data = error.response?.data;

  // Extract message from API response
  let message: string | undefined;

  if (data) {
    if (typeof data === 'string') {
      message = data;
    } else if (typeof data.message === 'string') {
      message = data.message;
    } else if (Array.isArray(data.message)) {
      message = typeof data.message[0] === 'string' ? data.message[0] : JSON.stringify(data.message[0]);
    } else if (typeof data.message === 'object' && data.message !== null) {
      // If message is an object, try to get a nested message or stringify it
      message = typeof data.message.message === 'string' ? data.message.message : JSON.stringify(data.message);
    } else if (data.error && typeof data.error === 'string') {
      message = data.error;
    }
  }

  if (!message) {
    message = STATUS_MAP[status]?.message ?? 'Đã có lỗi xảy ra';
  }

  const defaults = STATUS_MAP[status] ?? { action: 'toast' as const };

  return {
    status,
    message,
    action: defaults.action,
    redirectTo: defaults.redirectTo,
  };
}
