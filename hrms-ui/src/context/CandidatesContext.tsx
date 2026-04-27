import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Candidate } from "../components/candidates/types";
import { useAuth } from "./AuthContext";

type CandidatesContextType = {
  candidates: Candidate[];
  isLoading: boolean;
  refreshCandidates: () => Promise<void>;
  deleteCandidate: (id: number) => Promise<void>;
};

const CandidatesContext = createContext<CandidatesContextType | undefined>(undefined);

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export function CandidatesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCandidates = useCallback(async () => {
    if (!token) {
      setCandidates([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hono/candidates", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch {
      // Silently fail - keep existing data
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshCandidates();
  }, [refreshCandidates]);

  const deleteCandidate = async (id: number) => {
    const res = await fetch(`/api/hono/candidates/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete candidate");
    await refreshCandidates();
  };

  return (
    <CandidatesContext.Provider value={{ candidates, isLoading, refreshCandidates, deleteCandidate }}>
      {children}
    </CandidatesContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidatesContext);
  if (context === undefined) throw new Error("useCandidates must be used within a CandidatesProvider");
  return context;
}
