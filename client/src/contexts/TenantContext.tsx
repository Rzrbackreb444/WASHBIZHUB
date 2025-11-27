import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  heroTitle: string;
  heroSubtitle: string;
  tagline: string | null;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string;
  branding: TenantBranding;
  metaTitle: string;
  metaDescription: string;
  ogImage: string | null;
  enableCourses: boolean;
  enableMarketplace: boolean;
  enableCommunity: boolean;
  enableWhiteLabel: boolean;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  isStrokeRecoveryAcademy: boolean;
  isWashBizHub: boolean;
  isHawgWash: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: tenant, isLoading } = useQuery<Tenant>({
    queryKey: ["/api/tenant"],
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const isStrokeRecoveryAcademy = tenant?.slug === "strokerecoveryacademy";
  const isWashBizHub = tenant?.slug === "washbizhub";
  const isHawgWash = tenant?.slug === "hawgwash";

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isStrokeRecoveryAcademy) {
      body.classList.add("sra-theme");
      root.classList.remove("dark");
    } else {
      body.classList.remove("sra-theme");
    }

    return () => {
      body.classList.remove("sra-theme");
    };
  }, [isStrokeRecoveryAcademy]);

  return (
    <TenantContext.Provider
      value={{
        tenant: tenant || null,
        isLoading,
        isStrokeRecoveryAcademy,
        isWashBizHub,
        isHawgWash,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
