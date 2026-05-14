"use client";

import React from "react";
import { Layout, Button, Avatar, Dropdown, App } from "antd";
import type { MenuProps } from "antd";
import {
  RiNotification3Line,
  RiUserLine,
  RiSettings4Line,
  RiLogoutBoxLine,
} from "@remixicon/react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

const { Header } = Layout;

export function DashboardTopbar() {
  const { message } = App.useApp();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "My Profile",
      icon: <RiUserLine size={16} />,
      onClick: () => router.push("/dashboard/settings/profile"),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <RiSettings4Line size={16} />,
      onClick: () => router.push("/dashboard/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Sign Out",
      icon: <RiLogoutBoxLine size={16} />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="!bg-background !px-6 !h-16 flex items-center justify-end border-b border-surface-variant sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Button
          type="text"
          icon={
            <RiNotification3Line
              size={20}
              className="text-on-surface-variant"
            />
          }
          className="rounded-full w-10 h-10 flex items-center justify-center hover:bg-surface-container-low"
        />

        <div className="h-6 w-[1px] bg-outline-variant mx-1" />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="text-right hidden sm:block flex sm:flex items-center gap-2">
              <p className="text-body-sm font-semibold text-on-surface leading-tight">
                {user?.fullName ?? "Anonymous"}
              </p>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Administrator
              </p>
            </div>
            <Avatar
              size={40}
              className="bg-primary/10 text-primary border border-primary/20 group-hover:border-primary transition-colors"
              icon={<RiUserLine size={24} />}
            />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}

