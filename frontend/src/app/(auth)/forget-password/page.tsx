'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { App, Form, Input, Button, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth.api';
import { parseApiError } from '@/lib/errorHandler';

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgetPasswordPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
      message.success('Đã gửi liên kết khôi phục mật khẩu!');
    } catch (err) {
      const appError = parseApiError(err);
      message.error(appError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center antialiased text-on-background">
      <main className="w-full max-w-md px-6 py-12">
        {/* Brand */}
        <div className="text-center mb-12">
          <span className="text-display text-primary tracking-tight">Cinlove</span>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient-crisp border border-surface-container-highest p-8 sm:p-10">
          {sent ? (
            <Result
              icon={<CheckCircleOutlined className="!text-primary" />}
              title={
                <span className="text-h3 text-on-surface">Đã gửi liên kết!</span>
              }
              subTitle={
                <span className="text-body-sm text-on-surface-variant">
                  Chúng tôi đã gửi liên kết khôi phục mật khẩu đến email của bạn. Vui lòng kiểm
                  tra hộp thư (bao gồm cả thư mục spam).
                </span>
              }
              extra={
                <Link href="/login">
                  <Button type="primary" icon={<ArrowLeftOutlined />} size="large">
                    Quay lại Đăng nhập
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-h2 text-on-surface mb-2">Khôi phục mật khẩu</h1>
                <p className="text-body-sm text-on-surface-variant">
                  Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn một liên kết để
                  tạo mật khẩu mới.
                </p>
              </div>

              <Form<ForgotPasswordFormValues>
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                size="large"
              >
                <Form.Item
                  label={
                    <span className="text-label-caps text-on-surface uppercase">Email</span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-on-surface-variant" />}
                    placeholder="nhapemail@vd.com"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    className="!h-12 !text-button !font-medium"
                  >
                    Gửi liên kết
                  </Button>
                </Form.Item>
              </Form>

              <div className="text-center">
                <Link
                  className="inline-flex items-center gap-1 text-button text-primary hover:text-primary-container transition-colors"
                  href="/login"
                >
                  <ArrowLeftOutlined className="text-[14px]" />
                  Quay lại Đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
