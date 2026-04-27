import { useState, useRef } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown, Mail, Phone, GraduationCap,
  Briefcase, Upload, Loader2, CheckCircle2, Sparkles, X, Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

// Extracted sub-components
import type { Candidate } from "./candidates/types";
import { getSkillColor } from "./candidates/score-utils";
import { RankBadge } from "./candidates/RankBadge";
import { ScoreBar } from "./candidates/ScoreBar";
import { CandidateMobileCard } from "./candidates/CandidateMobileCard";
import { UploadModal } from "./candidates/UploadModal";

import { useCandidates } from "@/context/CandidatesContext";
import { useDashboard } from "@/context/DashboardContext";

// Table Columns
const columns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "rank",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-10 text-center">#</div>,
    cell: ({ row }) => <div className="flex justify-center"><RankBadge rank={row.original.rank ?? 0} /></div>,
    size: 56,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 select-none text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Candidate <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-[14px] text-gray-900">{c.name === "Not Found" || c.name === "Unknown Candidate" ? c.filename : c.name}</span>
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            <div className="flex items-center gap-1"><Mail size={11} className="text-gray-400" /><span className="truncate max-w-[180px]">{c.email}</span></div>
            {c.phone && c.phone !== "Not Found" && <div className="flex items-center gap-1"><Phone size={11} className="text-gray-400" /><span>{c.phone}</span></div>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "education",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Education</div>,
    cell: ({ row }) => {
      const edu = row.original.education;
      if (!edu || edu === "Not Found") return <span className="text-[12px] text-gray-400 italic">—</span>;
      return <div className="flex items-start gap-1.5"><GraduationCap size={13} className="text-indigo-400 shrink-0 mt-0.5" /><span className="text-[12px] text-gray-700 leading-tight">{edu}</span></div>;
    },
  },
  {
    accessorKey: "experience",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Experience</div>,
    cell: ({ row }) => {
      const exp = row.original.experience;
      if (!exp || exp === "Fresher" || exp === "Fresher / Not Specified") {
        return <Badge variant="outline" className="text-[10px] h-5 px-2 rounded-full font-medium shadow-none bg-slate-50 text-slate-500 border-slate-200 whitespace-nowrap">Fresher</Badge>;
      }
      return <div className="flex items-center gap-1.5"><Briefcase size={12} className="text-amber-500 shrink-0" /><span className="text-[12px] font-medium text-gray-800 whitespace-nowrap">{exp}</span></div>;
    },
  },
  {
    accessorKey: "skills",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Skills</div>,
    cell: ({ row }) => {
      const skills = row.original.skills;
      if (!skills || skills.length === 0) return <span className="text-[12px] text-gray-400 italic">No skills</span>;
      const visible = skills.slice(0, 3);
      const extra = skills.length - visible.length;
      return (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {visible.map((s) => <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSkillColor(s)}`}>{s}</span>)}
          {extra > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">+{extra}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "matchScore",
    header: ({ column }) => (
      <div onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 select-none text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Match Score <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: ({ row }) => <ScoreBar score={row.original.matchScore ?? (row.original as any).match_score ?? 0} />,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</div>,
    cell: ({ row }) => {
      const st = row.original.status;
      return (
        <Badge variant="outline" className={`text-[10px] h-5 px-2 rounded-full font-medium shadow-none whitespace-nowrap ${st === "Processed" || st === "New" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
          {st}
        </Badge>
      );
    },
  },
];

// Main Component
export default function CandidatesTable() {
  const { candidates, isLoading: loading, refreshCandidates } = useCandidates();
  const { refreshDashboard } = useDashboard();
  
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expectedSkills, setExpectedSkills] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Toast helper
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Upload handler
  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadSuccess(false);
    setIsUploadModalOpen(false);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      
      const skillsArr = expectedSkills.split(",").map(s => s.trim()).filter(Boolean);
      if (skillsArr.length > 0) {
        formData.append("expected_skills", JSON.stringify(skillsArr));
      }

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadSuccess(true);

        // Persist each candidate to Hono backend for long-term storage
        const token = localStorage.getItem("token") || "";
        const parsed: Candidate[] = data.candidates || [];
        await Promise.allSettled(
          parsed.map((c: any) =>
            fetch("/api/hono/candidates", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                filename: c.filename,
                name: c.name,
                email: c.email,
                phone: c.phone,
                location: c.location,
                education: c.education,
                experience: c.experience,
                skills: c.skills,
                match_score: c.match_score,
                status: "New",
                linkedin: c.linkedin || "",
                github: c.github || "",
                portfolio: c.portfolio || "",
                certifications: c.certifications || [],
                languages: c.languages || [],
                summary: c.summary || "",
                university: c.university || "",
                grad_year: c.grad_year || "",
                work_history: c.work_history || [],
                fingerprint: c.fingerprint || "",
              }),
            }).then(res => {
              if (res.status === 409) {
                console.warn(`Duplicate detected: ${c.name}`);
              }
              return res;
            })
          )
        );

        showToast(`✅ ${data.message}`, "success");
        setSelectedFiles([]);
        setExpectedSkills("");

        await refreshCandidates();
        await refreshDashboard();
        setTimeout(() => setUploadSuccess(false), 4000);
      } else {
        showToast(`Upload failed: ${data.error || "Unknown error"}`, "error");
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Download CSV handler
  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/hono/candidates/csv", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "CSV not available yet.", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidates_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("CSV downloaded successfully!", "success");
    } catch {
      showToast("Failed to download CSV.", "error");
    }
  };

  // Upload Button (rendered in DataTable header)
  const uploadAction = (
    <div className="flex items-center gap-2">
      {uploadSuccess && (
        <span className="text-[11px] text-emerald-600 font-medium animate-pulse whitespace-nowrap">
          ✅ Table refreshed!
        </span>
      )}

      {/* Download CSV */}
      <button
        id="download-csv-btn"
        type="button"
        onClick={handleDownloadCSV}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-[12px] font-semibold
          shadow-sm border border-gray-200 bg-white text-gray-700
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
          active:scale-[0.97] transition-all duration-200 cursor-pointer select-none whitespace-nowrap"
      >
        <Download size={14} /> 
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">Export</span>
      </button>

      {/* Upload Resumes */}
      <button
        id="bulk-upload-btn"
        type="button"
        disabled={uploading}
        onClick={() => setIsUploadModalOpen(true)}
        className={`
          inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-[12px] font-semibold
          shadow-sm border transition-all duration-200 cursor-pointer select-none whitespace-nowrap
          ${uploading
            ? "bg-black text-white hover:bg-black/90"
            : uploadSuccess
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-black text-white hover:bg-gray-800 hover:shadow-md active:scale-[0.97]"
          }
          disabled:cursor-not-allowed
        `}
      >
        {uploading ? (
          <><Sparkles size={14} className="animate-pulse" /><Loader2 size={14} className="animate-spin" /> <span className="hidden sm:inline">Processing AI…</span><span className="sm:hidden">Wait…</span></>
        ) : uploadSuccess ? (
          <><CheckCircle2 size={14} /> Done!</>
        ) : (
          <><Upload size={14} /> <span className="hidden sm:inline">Upload Resumes</span><span className="sm:hidden">Upload</span></>
        )}
      </button>

      {/* Hidden file input (legacy ref for clearing) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        className="hidden"
      />
    </div>
  );

  const renderMobileCard = (row: any) => {
    const c = row.original as Candidate;
    return <CandidateMobileCard key={row.original.id} candidate={c} />;
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={candidates}
        isLoading={loading || uploading}
        title="Candidates"
        searchPlaceholder="Find..."
        mode="client"
        renderMobileCard={renderMobileCard}
        primaryAction={uploadAction}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        expectedSkills={expectedSkills}
        onExpectedSkillsChange={setExpectedSkills}
        selectedFiles={selectedFiles}
        onFileSelect={setSelectedFiles}
        uploading={uploading}
        onConfirm={handleConfirmUpload}
      />

      {/* Floating Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-4 ${
            toast.type === "success"
              ? "bg-emerald-50/95 text-emerald-800 border-emerald-200"
              : "bg-red-50/95 text-red-800 border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          ) : (
            <X size={18} className="text-red-500 shrink-0" />
          )}
          <span className="text-[13px] font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-0.5 rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={14} className="opacity-50" />
          </button>
        </div>
      )}
    </>
  );
}
