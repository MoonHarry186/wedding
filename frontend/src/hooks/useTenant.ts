import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi, type UpdateTenantPayload, type UpdateStorefrontPayload, type InviteMemberPayload } from '@/api/tenants.api';
import type { Role } from '@/types/api';

export const TENANT_KEYS = {
  info: ['tenant'] as const,
  members: ['tenant', 'members'] as const,
  storefront: ['tenant', 'storefront'] as const,
};

export function useTenant() {
  return useQuery({
    queryKey: TENANT_KEYS.info,
    queryFn: tenantsApi.get,
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTenantPayload) => tenantsApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.info }),
  });
}

export function useMembers() {
  return useQuery({
    queryKey: TENANT_KEYS.members,
    queryFn: tenantsApi.getMembers,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteMemberPayload) => tenantsApi.inviteMember(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.members }),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      tenantsApi.updateMemberRole(memberId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.members }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => tenantsApi.removeMember(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.members }),
  });
}

export function useStorefront() {
  return useQuery({
    queryKey: TENANT_KEYS.storefront,
    queryFn: tenantsApi.getStorefront,
  });
}

export function useUpdateStorefront() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStorefrontPayload) => tenantsApi.updateStorefront(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.storefront }),
  });
}

export function useSetCustomDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => tenantsApi.setCustomDomain(domain),
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.storefront }),
  });
}

export function useVerifyDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tenantsApi.verifyDomain,
    onSuccess: () => qc.invalidateQueries({ queryKey: TENANT_KEYS.storefront }),
  });
}
