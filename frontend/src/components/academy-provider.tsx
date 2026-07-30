"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api/client";
import type { Academy } from "@/types";

type AcademyContextValue = {
  academy: Academy | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setAcademy: (academy: Academy) => void;
};

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setAcademy(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getMyAcademy(accessToken);
      setAcademy(data);
    } catch {
      setAcademy(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ academy, loading, refresh, setAcademy }),
    [academy, loading, refresh],
  );

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademy() {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error("useAcademy yalnızca AcademyProvider içinde kullanılabilir");
  }
  return context;
}
