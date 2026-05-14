"use client";

import React, { useEffect } from "react";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const antdTheme = {
  token: {
    colorPrimary: "#070235",
    colorBgBase: "#f7f9fb",
    colorTextBase: "#191c1e",
    colorBorder: "#c8c5d0",
    colorBorderSecondary: "#e0e3e5",
    borderRadius: 12,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    colorError: "#ba1a1a",
    colorSuccess: "#2e7d32",
    colorWarning: "#e65100",
    colorLink: "#070235",
  },
  components: {
    Menu: {
      itemBorderRadius: 4,
      itemSelectedBg: "#f2f4f6",
      itemSelectedColor: "#070235",
      itemHoverBg: "#f2f4f6",
      subMenuItemBg: "transparent",
    },
    Button: {
      borderRadius: 9999,
      controlHeight: 40,
      fontWeight: 500,
    },
    Input: {
      controlHeight: 40,
    },
    Select: {
      controlHeight: 40,
    },
    Collapse: {
      borderRadius: 8,
      display: "flex"
    },
  },
};

function AuthInit() {
  const { setAuth, logout, setHydrated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) {
      setHydrated();
      return;
    }
    authApi
      .me()
      .then((data) => setAuth(data.user, data.tenant, data.role))
      .catch(() => logout())
      .finally(() => setHydrated());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <AuthInit />
          {children}
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
