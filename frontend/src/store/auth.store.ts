import { create } from 'zustand';
import type { ApiUser, ApiTenant, Role } from '@/types/api';

interface AuthState {
  user: ApiUser | null;
  tenant: ApiTenant | null;
  role: Role | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (user: ApiUser, tenant: ApiTenant, role: Role) => void;
  setHydrated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  tenant: null,
  role: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, tenant, role) =>
    set({ user, tenant, role, isAuthenticated: true }),

  setHydrated: () => set({ isHydrated: true }),

  logout: () =>
    set({ user: null, tenant: null, role: null, isAuthenticated: false }),
}));
