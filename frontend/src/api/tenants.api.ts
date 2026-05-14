import { api } from '@/lib/axios';
import type { ApiTenant, ApiMember, ApiStorefront, Role } from '@/types/api';

export interface UpdateTenantPayload {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
  role: 'admin' | 'editor';
}

export interface UpdateStorefrontPayload {
  bannerUrl?: string;
  welcomeText?: string;
  seoTitle?: string;
  seoDescription?: string;
  themeColor?: string;
  socialLinks?: Record<string, string>;
  isActive?: boolean;
}

export const tenantsApi = {
  get: () =>
    api.get<ApiTenant & { currentUser: { id: string; email: string; fullName: string; role: Role } }>(
      '/tenants/me'
    ).then((r) => r.data),

  update: (data: UpdateTenantPayload) =>
    api.put<ApiTenant>('/tenants/me', data).then((r) => r.data),

  getMembers: () =>
    api.get<ApiMember[]>('/tenants/me/members').then((r) => r.data),

  inviteMember: (data: InviteMemberPayload) =>
    api.post<ApiMember>('/tenants/me/members/invite', data).then((r) => r.data),

  updateMemberRole: (memberId: string, role: Role) =>
    api.put<ApiMember>(`/tenants/me/members/${memberId}/role`, { role }).then((r) => r.data),

  removeMember: (memberId: string) =>
    api.delete(`/tenants/me/members/${memberId}`),

  getStorefront: () =>
    api.get<ApiStorefront>('/tenants/me/storefront').then((r) => r.data),

  updateStorefront: (data: UpdateStorefrontPayload) =>
    api.put<ApiStorefront>('/tenants/me/storefront', data).then((r) => r.data),

  setCustomDomain: (customDomain: string) =>
    api.post<{ verificationToken: string }>('/tenants/me/storefront/domain', { customDomain }).then((r) => r.data),

  verifyDomain: () =>
    api.post<{ verified: boolean }>('/tenants/me/storefront/verify-domain').then((r) => r.data),
};
