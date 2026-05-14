"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { App, Form, Input, Button, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { parseApiError } from "@/lib/errorHandler";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const data = await authApi.login({
        email: values.email,
        password: values.password,
      });
      setAuth(data.user, data.tenant, data.role);
      message.success("Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (err) {
      const appError = parseApiError(err);
      message.error(appError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased">
      {/* Left — Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-variant overflow-hidden">
        <img
          alt="Luxury stationery"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0JS--pnbSm1bzbDgY-zLDtAsixPHDLOkKXXN21asSd8xPt9lOfhAYptMyOW1iOhiaMsGzp0DxcPkw63ZpBWpY6b9IpT7zC5VDJ0HrsZlJx_qNwzIXDUmJibv8Wsy6350f0fqzE8hysViq8PlNYu9NErnza8KjMHpsYU8PoJ2y5inTxzcvJw0ArkVL9sxcHZaqqBR-co6h0NoqQq_lY5BGCXwnaIXLFBrE0D-IfYiZMZiQGxgJvwPqCOAje9HGOvTeRN0ieTKFgKjK"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <h2 className="text-h2 text-on-primary mb-4">
            Elevating Your Celebrations
          </h2>
          <p className="text-body-lg text-on-primary/90 max-w-md">
            Experience the perfect blend of digital convenience and premium
            stationery aesthetics with Cinlove.
          </p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 relative bg-surface-container-lowest">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          {/* Brand */}
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-display text-primary-container mb-2">
              Cinlove
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Sign in to manage your events and designs.
            </p>
          </div>

          {/* Antd Form */}
          <Form<LoginFormValues>
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ remember: false }}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              label={
                <span className="text-label-caps text-on-surface uppercase">
                  Email Address
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-outline" />}
                placeholder="name@company.com"
              />
            </Form.Item>

            <Form.Item
              className="[&_.ant-form-item-label]:!w-full [&_.ant-form-item-label>label]:!w-full"
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="text-label-caps text-on-surface uppercase">
                    Password
                  </span>
                  <Link
                    className="text-body-sm text-primary hover:text-primary-container transition-colors font-medium !no-underline"
                    href="/forget-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
              }
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-outline" />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>
                <span className="text-body-sm text-on-surface-variant">
                  Remember me for 30 days
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="!h-12 !text-button !font-medium !shadow-sm"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Register Link */}
          <p className="mt-12 text-center text-body-md text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-primary hover:text-primary-container transition-colors"
              href="/register"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

