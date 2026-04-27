import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type DashboardMetrics = {
  totalCandidates: number;
  activeJobs: number;
  recentUploads: any[];
};

type DashboardContextType = {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  refreshDashboard: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    if (!token) {
      setMetrics(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hono/dashboard", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch {
      // Silently fail - retain existing structure if possible
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return (
    <DashboardContext.Provider value={{ metrics, isLoading, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}
