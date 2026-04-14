import { createContext, useContext, useState, type ReactNode } from "react";

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

const MOCK_JOBS: Job[] = [
  { id: "1", title: "Senior Frontend Developer", department: "Engineering", status: "Active", type: "Full-time", location: "Remote", applicants: 45, postedDate: "2 days ago" },
  { id: "2", title: "Product Marketing Manager", department: "Marketing", status: "Draft", type: "Contract", location: "Hybrid", applicants: 0, postedDate: "1 hour ago" },
  { id: "3", title: "UX/UI Designer", department: "Design", status: "Closed", type: "Full-time", location: "Remote", applicants: 112, postedDate: "14 days ago" },
];

type JobsContextType = {
  jobs: Job[];
  addJob: (job: Job) => void;
  updateJob: (id: string, updated: Partial<Job>) => void;
};

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const addJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
  };

  const updateJob = (id: string, updated: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updated } : j))
    );
  };

  return (
    <JobsContext.Provider value={{ jobs, addJob, updateJob }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
}
