'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { App, Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, ShopOutlined, MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { parseApiError } from '@/lib/errorHandler';

interface RegisterFormValues {
  fullName: string;
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<RegisterFormValues>();

  // Sync tenantName to tenantSlug
  const tenantNameValue = Form.useWatch('tenantName', form);
  useEffect(() => {
    if (tenantNameValue) {
      const slug = tenantNameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setFieldsValue({ tenantSlug: slug });
    }
  }, [tenantNameValue, form]);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const data = await authApi.register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        tenantSlug: values.tenantSlug,
        tenantName: values.tenantName,
      });
      setAuth(data.user, data.tenant, data.role);
      message.success('Tạo tài khoản thành công!');
      router.push('/dashboard');
    } catch (err) {
      const appError = parseApiError(err);
      message.error(appError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background text-on-background min-h-screen flex items-stretch antialiased">
      <div className="w-full flex">
        {/* Left — Brand Visual */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest border-r border-surface-variant">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCk-1ZovLQEgtSphRCRoam1VZ7_Kz-_khNl51PVJO5weYrAIVqJY71NIPFn7KBR2zJ5EXgze3FmaiwSsh3-u9ES9TuLRCf-J-ItH4-SZ8wVW6ys-vnBvPAQzIbN8EIAbhOAjdAiOwTxf-w8CsJBIKM2PIp_-OlYSbVkaIR3l--RSTydeTbJb-sfwV24Guly-uyTMTKj54ED-5MoXdZ64B896llU2hyYTiASmfoPhK0O4T1jzZQZLvOXTE4SXmZbeehutyQfTrsOZc8z')`,
            }}
          />
          <div className="absolute inset-0 bg-primary/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
            <h1 className="text-display text-surface-container-lowest mb-6 drop-shadow-lg">
              Crafting Memorable Impressions.
            </h1>
            <p className="text-body-lg text-surface-container-lowest/90 drop-shadow-md max-w-md">
              Join Cinlove to design, manage, and deliver premium digital experiences for
              your clients.
            </p>
          </div>
        </div>

        {/* Right — Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-16 bg-background">
          <div className="w-full max-w-md flex flex-col gap-8">
            {/* Header */}
            <div className="text-center md:text-left">
              <div className="text-h2 text-primary font-semibold mb-4 lg:hidden">
                Cinlove
              </div>
              <h2 className="text-h1 text-on-background mb-2">Create an account</h2>
              <p className="text-body-md text-on-surface-variant">
                Start your journey as an event professional.
              </p>
            </div>

            {/* Antd Form */}
            <Form<RegisterFormValues>
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label={<span className="text-label-caps text-on-surface-variant uppercase">Full Name</span>}
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-outline" />}
                  placeholder="Jane Doe"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-label-caps text-on-surface-variant uppercase">
                    Business / Studio Name
                  </span>
                }
                name="tenantName"
                rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
              >
                <Input
                  prefix={<ShopOutlined className="text-outline" />}
                  placeholder="Jane Doe Designs"
                />
              </Form.Item>
              
              <Form.Item
                label={<span className="text-label-caps text-on-surface-variant uppercase">Subdomain</span>}
                name="tenantSlug"
                rules={[
                  { required: true, message: 'Vui lòng nhập subdomain' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Subdomain chỉ được chứa chữ cái, số và dấu gạch ngang' }
                ]}
              >
                <Input
                  placeholder="jane-doe-designs"
                  addonAfter={<span className="text-on-surface-variant text-sm">.cinlove.vn</span>}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-label-caps text-on-surface-variant uppercase">
                    Email Address
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-outline" />}
                  placeholder="jane@example.com"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-label-caps text-on-surface-variant uppercase">Password</span>
                }
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-outline" />}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-label-caps text-on-surface-variant uppercase">Confirm Password</span>
                }
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-outline" />}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('Vui lòng đồng ý với Điều khoản dịch vụ')),
                  },
                ]}
              >
                <Checkbox>
                  <span className="text-body-sm text-on-surface-variant">
                    I agree to the{' '}
                    <a
                      className="text-primary hover:text-primary-container font-medium hover:underline transition-colors"
                      href="#"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      className="text-primary hover:text-primary-container font-medium hover:underline transition-colors"
                      href="#"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={!loading ? <ArrowRightOutlined /> : undefined}
                  iconPlacement="end"
                  className="!h-12 !text-button !font-medium !shadow-sm"
                >
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            {/* Footer Link */}
            <div className="text-center pt-6 border-t border-surface-variant">
              <p className="text-body-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link
                  className="text-primary font-medium hover:text-primary-container hover:underline transition-colors ml-1"
                  href="/login"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
