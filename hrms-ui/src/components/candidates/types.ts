export type WorkHistoryEntry = {
  company?: string;
  title?: string;
  duration?: string;
};

export type Candidate = {
  id: number;
  filename: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  profile_pic: string;
  skills: string[];
  match_score?: number;
  matchScore?: number;
  status: string;
  rank?: number;
  // New 18-layer fields
  linkedin?: string;
  github?: string;
  portfolio?: string;
  certifications?: string[];
  languages?: string[];
  summary?: string;
  university?: string;
  gradYear?: string;
  grad_year?: string;
  workHistory?: WorkHistoryEntry[];
  work_history?: WorkHistoryEntry[];
  fingerprint?: string;
};
