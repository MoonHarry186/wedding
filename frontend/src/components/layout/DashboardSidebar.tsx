"use client";

import React from "react";
import { Layout, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import type { MenuProps } from "antd";
import { RiQuestionLine, RiLogoutBoxLine } from "@remixicon/react";
import { menuItems } from "@/constants/menu.constant";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/api/auth.api";
import type { Role } from "@/types/api";

const { Sider } = Layout;

function buildAntdMenuItems(role: Role): MenuProps["items"] {
  return menuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (item.type === "group") {
        return {
          key: item.key,
          label: item.label,
          icon: <item.icon size={18} />,
          children: item.children
            .filter((child) => child.roles.includes(role))
            .map((child) => ({
              key: child.href,
              label: child.label,
              icon: <child.icon size={16} />,
            })),
        };
      }
      return {
        key: item.href,
        label: item.label,
        icon: <item.icon size={18} />,
      };
    });
}

function resolveSelectedKey(pathname: string) {
  const candidates = menuItems.flatMap((item) =>
    item.type === "group" ? item.children.map((child) => child.href) : [item.href],
  );

  const matched = candidates
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return matched ?? pathname;
}

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant, role, logout } = useAuthStore();

  const items = buildAntdMenuItems(role ?? "owner");

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.push("/login");
  };

  // Find the selected key based on current pathname
  const selectedKey = resolveSelectedKey(pathname);

  return (
    <Sider
      width={256}
      className="!bg-white border-r border-surface-variant h-full"
      theme="light"
      breakpoint="lg"
      collapsedWidth={0}
    >
      <div className="flex flex-col h-full py-6 px-4">
        {/* Header */}
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-low shrink-0 border border-surface-variant flex items-center justify-center">
            <span className="text-h3 font-serif font-bold text-primary">
              {tenant?.name?.charAt(0) ?? "A"}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-xl text-primary font-bold leading-tight truncate">
              {tenant?.name ?? "Cinlove"}
            </h2>
            <span className="text-label-caps text-on-surface-variant uppercase">
              Enterprise Tier
            </span>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={["templates", "business", "settings"]}
            items={items}
            onClick={handleClick}
            className="!border-none !bg-transparent"
          />
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-surface-variant flex flex-col gap-1 px-2">
          <button className="text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium w-full text-left">
            <RiQuestionLine size={18} />
            Help Center
          </button>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium w-full text-left"
          >
            <RiLogoutBoxLine size={18} />
            Log Out
          </button>
        </div>
      </div>
    </Sider>
  );
}
