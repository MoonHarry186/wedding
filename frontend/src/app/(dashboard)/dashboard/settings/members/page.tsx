"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  App,
  Popconfirm,
  Typography,
  Breadcrumb,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tooltip,
  Avatar,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  RiUserAddLine,
  RiDeleteBinLine,
  RiTeamLine,
  RiShieldUserLine,
  RiUserFollowLine,
  RiSearchLine,
} from "@remixicon/react";
import {
  useMembers,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useTenant";
import { useAuthStore } from "@/store/auth.store";
import type { ApiMember, Role } from "@/types/api";

const { Title, Text } = Typography;

const ROLE_LABEL: Record<Role, string> = {
  owner: "Chủ sở hữu",
  admin: "Quản trị viên",
  editor: "Biên tập viên",
  viewer: "Người xem",
};

const ROLE_COLOR: Record<Role, { color: string; bg: string; text: string }> = {
  owner: { color: "purple", bg: "bg-purple-50", text: "text-purple-600" },
  admin: { color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
  editor: { color: "cyan", bg: "bg-cyan-50", text: "text-cyan-600" },
  viewer: { color: "default", bg: "bg-gray-50", text: "text-gray-600" },
};

export default function MembersPage() {
  const { message } = App.useApp();
  const { data: members, isLoading } = useMembers();
  const inviteMember = useInviteMember();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<{ email: string; role: "admin" | "editor" }>();

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        (m.user?.email ?? "").toLowerCase().includes(q) ||
        (m.user?.fullName ?? "").toLowerCase().includes(q),
    );
  }, [members, search]);

  const stats = useMemo(() => {
    if (!members) return { total: 0, admins: 0, editors: 0 };
    return {
      total: members.length,
      admins: members.filter((m) => m.role === "admin" || m.role === "owner")
        .length,
      editors: members.filter((m) => m.role === "editor").length,
    };
  }, [members]);

  const handleInvite = async (values: {
    email: string;
    role: "admin" | "editor";
  }) => {
    try {
      await inviteMember.mutateAsync(values);
      message.success(`Đã mời ${values.email}`);
      form.resetFields();
      setModalOpen(false);
    } catch {
      message.error("Không thể gửi lời mời. Vui lòng thử lại.");
    }
  };

  const handleRoleChange = async (memberId: string, role: Role) => {
    try {
      await updateRole.mutateAsync({ memberId, role });
      message.success("Đã cập nhật vai trò");
    } catch {
      message.error("Không thể cập nhật vai trò");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId);
      message.success("Đã xóa thành viên");
    } catch {
      message.error("Không thể xóa thành viên");
    }
  };

  const columns: ColumnsType<ApiMember> = [
    {
      title: "Thành viên",
      key: "member",
      render: (_, m) => (
        <Space size="middle">
          <Avatar
            size="large"
            className="bg-primary-container text-on-primary-container shrink-0"
          >
            {(m.user?.fullName ?? m.user?.email ?? "?").charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-body-sm leading-tight">
              {m.user?.fullName ?? (
                <span className="italic text-on-surface-variant font-normal">
                  Chưa có tên
                </span>
              )}
            </Text>
            <Text type="secondary" className="text-[11px]">
              {m.user?.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 180,
      render: (_, m) => (
        <Tag
          color={ROLE_COLOR[m.role].color}
          variant="filled"
          className="rounded-full px-3 text-[11px] font-medium uppercase tracking-wider"
        >
          {ROLE_LABEL[m.role]}
        </Tag>
      ),
    },
    {
      title: "Ngày tham gia",
      key: "joinedAt",
      width: 150,
      render: (_, m) => (
        <Text type="secondary" className="text-body-sm">
          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : "—"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 240,
      align: "right" as const,
      render: (_, m) => {
        const isOwner = m.role === "owner";
        const isSelf = m.user?.id === currentUserId;
        return (
          <Space size="middle">
            {!isOwner && !isSelf && (
              <Select
                value={m.role}
                size="small"
                className="w-32"
                onChange={(role) => handleRoleChange(m.id, role)}
                options={[
                  { value: "admin", label: "Quản trị viên" },
                  { value: "editor", label: "Biên tập viên" },
                  { value: "viewer", label: "Người xem" },
                ]}
              />
            )}
            <Popconfirm
              title="Xóa thành viên này?"
              description="Hành động này không thể hoàn tác."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleRemove(m.id)}
              disabled={isOwner || isSelf}
            >
              <Tooltip title={isOwner || isSelf ? "" : "Xóa thành viên"}>
                <Button
                  type="text"
                  danger
                  disabled={isOwner || isSelf}
                  icon={<RiDeleteBinLine size={18} />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="pt-6 px-6 pb-2 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Cài đặt" },
              { title: "Thành viên" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Quản lý Thành viên
          </Title>
          <Text type="secondary">
            Phân quyền và quản lý nhân sự tham gia vận hành cửa hàng.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<RiUserAddLine size={18} />}
          size="large"
          className="rounded-xl h-12 px-6"
          onClick={() => setModalOpen(true)}
        >
          Mời thành viên
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={24}>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Tổng số thành viên
                </span>
              }
              value={stats.total}
              prefix={<RiTeamLine size={20} className="mr-2 text-primary" />}
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Quản trị viên
                </span>
              }
              value={stats.admins}
              prefix={
                <RiShieldUserLine size={20} className="mr-2 text-primary" />
              }
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Biên tập viên
                </span>
              }
              value={stats.editors}
              prefix={
                <RiUserFollowLine size={20} className="mr-2 text-primary" />
              }
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant overflow-hidden"
      >
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Input
            placeholder="Tìm theo tên hoặc email..."
            prefix={
              <RiSearchLine size={18} className="text-on-surface-variant" />
            }
            className="w-80 rounded-lg h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table<ApiMember>
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          scroll={{ y: "calc(100vh - 520px)" }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            className: "px-6 py-4",
          }}
          className="border-t border-outline-variant"
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Chưa có thành viên nào" 
              />
            ) 
          }}
        />
      </Card>

      {/* Invite Modal */}
      <Modal
        title={
          <span className="font-serif text-xl">Mời thành viên mới</span>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleInvite}
          className="mt-6"
        >
          <Form.Item
            name="email"
            label={<Text strong>Email mời</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              placeholder="vd: name@company.com"
              size="large"
              className="rounded-xl h-12"
            />
          </Form.Item>
          <Form.Item
            name="role"
            label={<Text strong>Vai trò hệ thống</Text>}
            initialValue="editor"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              className="h-12"
              options={[
                {
                  value: "admin",
                  label: "Quản trị viên — Toàn quyền trừ thanh toán",
                },
                { value: "editor", label: "Biên tập viên — Chỉ quản lý nội dung" },
                { value: "viewer", label: "Người xem — Chỉ xem dữ liệu" },
              ]}
            />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-8">
            <Button
              onClick={() => {
                setModalOpen(false);
                form.resetFields();
              }}
              className="h-11 rounded-xl px-6"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={inviteMember.isPending}
              className="h-11 rounded-xl px-10"
            >
              Gửi lời mời
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
