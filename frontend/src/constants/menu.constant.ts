import type { ComponentType } from 'react';
import {
  RiDashboardLine,
  RiLayoutLine,
  RiListCheck,
  RiShoppingBag3Line,
  RiOrderPlayLine,
  RiUserLine,
  RiMailLine,
  RiSettings3Line,
  RiStoreLine,
  RiTeamLine,
  RiVipCrownLine,
  RiGlobalLine,
  RiPaintLine,
  RiRobot2Line,
  RiMoneyDollarCircleLine,
} from '@remixicon/react';
import type { Role } from '@/types/api';

type MenuLeaf = {
  type: 'item';
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ size?: number | string }>;
  roles: Role[];
};

type MenuGroup = {
  type: 'group';
  key: string;
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  roles: Role[];
  children: MenuLeaf[];
};

export type MenuItem = MenuLeaf | MenuGroup;

export const menuItems: MenuItem[] = [
  {
    type: 'item',
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: RiDashboardLine,
    roles: ['owner', 'admin', 'editor', 'viewer'],
  },
  {
    type: 'group',
    key: 'templates',
    label: 'Mẫu thiệp',
    icon: RiLayoutLine,
    roles: ['owner', 'admin', 'editor'],
    children: [
      { type: 'item', key: 'templates-list', label: 'Danh sách', href: '/dashboard/templates', icon: RiListCheck, roles: ['owner', 'admin', 'editor'] },
      { type: 'item', key: 'templates-categories', label: 'Danh mục', href: '/dashboard/templates/categories', icon: RiSettings3Line, roles: ['owner', 'admin'] },
    ],
  },
  {
    type: 'group',
    key: 'business',
    label: 'Kinh doanh',
    icon: RiShoppingBag3Line,
    roles: ['owner', 'admin'],
    children: [
      { type: 'item', key: 'orders', label: 'Đơn hàng', href: '/dashboard/orders', icon: RiOrderPlayLine, roles: ['owner', 'admin'] },
      { type: 'item', key: 'customers', label: 'Khách hàng', href: '/dashboard/customers', icon: RiUserLine, roles: ['owner', 'admin'] },
      { type: 'item', key: 'invitations', label: 'Quản lý Thiệp', href: '/dashboard/invitations', icon: RiMailLine, roles: ['owner', 'admin'] },
    ],
  },
  {
    type: 'group',
    key: 'settings',
    label: 'Cài đặt',
    icon: RiSettings3Line,
    roles: ['owner', 'admin'],
    children: [
      { type: 'item', key: 'settings-general', label: 'Cài đặt chung', href: '/dashboard/settings', icon: RiStoreLine, roles: ['owner', 'admin'] },
      { type: 'item', key: 'settings-members', label: 'Thành viên', href: '/dashboard/settings/members', icon: RiTeamLine, roles: ['owner', 'admin'] },
      { type: 'item', key: 'settings-subscription', label: 'Gói dịch vụ', href: '/dashboard/settings/subscription', icon: RiVipCrownLine, roles: ['owner'] },
      { type: 'item', key: 'settings-domain', label: 'Domain', href: '/dashboard/settings/domain', icon: RiGlobalLine, roles: ['owner'] },
      { type: 'item', key: 'settings-storefront', label: 'Storefront', href: '/dashboard/settings/storefront', icon: RiPaintLine, roles: ['owner', 'admin'] },
    ],
  },
  {
    type: 'item',
    key: 'ai',
    label: 'AI',
    href: '/dashboard/ai',
    icon: RiRobot2Line,
    roles: ['owner', 'admin'],
  },
  {
    type: 'item',
    key: 'payouts',
    label: 'Payouts',
    href: '/dashboard/payouts',
    icon: RiMoneyDollarCircleLine,
    roles: ['owner'],
  },
];
