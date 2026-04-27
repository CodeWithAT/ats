import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type Job = {
  id: string;
  title: string;
  department: string;
  status: "Active" | "Draft" | "Closed";
  type: "Full-time" | "Part-time" | "Contract";
  location: "Remote" | "On-site" | "Hybrid";
  applicants: number;
  postedDate: string;
  description?: string;
};

type JobsContextType = {
  jobs: Job[];
  isLoading: boolean;
  addJob: (job: Omit<Job, "id" | "postedDate" | "applicants">) => Promise<void>;
  updateJob: (id: string, updated: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
};

const JobsContext = createContext<JobsContextType | undefined>(undefined);

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export function JobsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshJobs = useCallback(async () => {
    if (!token) {
      setJobs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hono/jobs", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.map((j: any) => ({ ...j, id: String(j.id) })));
      }
    } catch {
      // Silently fail - keep existing data
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  const addJob = async (job: Omit<Job, "id" | "postedDate" | "applicants">) => {
    const res = await fetch("/api/hono/jobs", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error("Failed to create job");
    await refreshJobs();
  };

  const updateJob = async (id: string, updated: Partial<Job>) => {
    const res = await fetch(`/api/hono/jobs/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error("Failed to update job");
    await refreshJobs();
  };

  const deleteJob = async (id: string) => {
    const res = await fetch(`/api/hono/jobs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete job");
    await refreshJobs();
  };

  return (
    <JobsContext.Provider value={{ jobs, isLoading, addJob, updateJob, deleteJob, refreshJobs }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) throw new Error("useJobs must be used within a JobsProvider");
  return context;
}
