import { useState, useEffect, useRef, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown, Mail, Phone, Trophy, GraduationCap,
  Briefcase, Upload, Loader2, CheckCircle2, Sparkles, X, Download, FileText, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useJobs } from "@/context/JobsContext";

/* ── Types ── */
type Candidate = {
  id: number; filename: string; name: string; email: string; phone: string;
  location: string; education: string; experience: string; profile_pic: string;
  skills: string[]; match_score: number; status: string;
};



/* ── Skill Colors ── */
const SKILL_COLORS: Record<string, string> = {
  python: "bg-sky-50 text-sky-700 border-sky-200",
  java: "bg-orange-50 text-orange-700 border-orange-200",
  react: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "node.js": "bg-green-50 text-green-700 border-green-200",
  javascript: "bg-yellow-50 text-yellow-700 border-yellow-200",
  typescript: "bg-blue-50 text-blue-700 border-blue-200",
  sql: "bg-indigo-50 text-indigo-700 border-indigo-200",
  aws: "bg-amber-50 text-amber-700 border-amber-200",
  docker: "bg-blue-50 text-blue-700 border-blue-200",
  "machine learning": "bg-purple-50 text-purple-700 border-purple-200",
  html: "bg-rose-50 text-rose-700 border-rose-200",
  css: "bg-pink-50 text-pink-700 border-pink-200",
  figma: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  django: "bg-emerald-50 text-emerald-700 border-emerald-200",
  golang: "bg-teal-50 text-teal-700 border-teal-200",
};
const getSkillColor = (s: string) => SKILL_COLORS[s.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-200";

/* ── Score helpers ── */
const getScoreGradient = (s: number) => s >= 70 ? "from-emerald-500 to-green-400" : s >= 45 ? "from-amber-500 to-yellow-400" : "from-rose-500 to-red-400";
const getScoreBg = (s: number) => s >= 70 ? "bg-emerald-50" : s >= 45 ? "bg-amber-50" : "bg-rose-50";
const getScoreText = (s: number) => s >= 70 ? "text-emerald-700" : s >= 45 ? "text-amber-700" : "text-rose-700";

/* ── Rank Badge ── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm"><Trophy size={14} className="text-white" /></div>;
  if (rank <= 3) return <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${rank === 2 ? "from-gray-300 to-gray-400" : "from-amber-600 to-amber-700"} flex items-center justify-center shadow-sm`}><span className="text-[11px] font-bold text-white">{rank}</span></div>;
  return <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><span className="text-[11px] font-semibold text-gray-500">{rank}</span></div>;
}



/* ── Table Columns ── */
const columns: ColumnDef<Candidate & { rank: number }>[] = [
  {
    accessorKey: "rank",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-10 text-center">#</div>,
    cell: ({ row }) => <div className="flex justify-center"><RankBadge rank={row.original.rank} /></div>,
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
    accessorKey: "match_score",
    header: ({ column }) => (
      <div onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 select-none text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Match Score <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: ({ row }) => {
      const score = row.original.match_score ?? 0;
      return (
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className={`relative w-20 h-2 rounded-full overflow-hidden ${getScoreBg(score)}`}>
            <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-700 ease-out`} style={{ width: `${Math.min(score, 100)}%` }} />
          </div>
          <span className={`text-[13px] font-semibold tabular-nums ${getScoreText(score)}`}>{score}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</div>,
    cell: ({ row }) => {
      const st = row.original.status;
      return (
        <Badge variant="outline" className={`text-[10px] h-5 px-2 rounded-full font-medium shadow-none whitespace-nowrap ${st === "Processed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
          {st}
        </Badge>
      );
    },
  },
];

/* ── Main Component ── */
export default function CandidatesTable() {
  const { jobs } = useJobs();
  const [candidates, setCandidates] = useState<(Candidate & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expectedSkills, setExpectedSkills] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  /* ── Fetch / Refresh candidates ── */
  const refreshCandidates = useCallback(async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(
        (data.candidates || []).map((c: Candidate, i: number) => ({ ...c, rank: i + 1 }))
      );
    } catch {
      // silently fail on refresh
    }
  }, []);

  useEffect(() => {
    refreshCandidates().finally(() => setLoading(false));
  }, [refreshCandidates]);

  /* ── Toast helper ── */
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  /* ── Upload handler ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadSuccess(false);

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
        showToast(`✅ ${data.message}`, "success");
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
        setExpectedSkills("");

        setLoading(true);
        await refreshCandidates();
        setLoading(false);

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

  const renderMobileCard = (row: any) => {
    const c = row.original as Candidate & { rank: number };
    const score = c.match_score ?? 0;
    const skills = c.skills || [];
    return (
      <div key={row.id} className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm gap-3 w-full">
        <div className="flex items-start gap-3">
          <RankBadge rank={c.rank} />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-[15px] text-gray-900 block truncate">{c.name === "Not Found" ? c.filename : c.name}</span>
            <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5"><Mail size={11} /><span className="truncate">{c.email}</span></div>
          </div>
          <span className={`text-[14px] font-bold tabular-nums ${getScoreText(score)}`}>{score}%</span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          {c.education && c.education !== "Not Found" && <div className="flex items-center gap-1 text-indigo-700"><GraduationCap size={12} className="text-indigo-400" /><span className="truncate max-w-[140px]">{c.education}</span></div>}
          <div className="flex items-center gap-1 text-gray-600"><Briefcase size={12} className="text-amber-500" /><span>{c.experience || "Fresher"}</span></div>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 5).map((s) => <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSkillColor(s)}`}>{s}</span>)}
            {skills.length > 5 && <span className="text-[10px] text-gray-400">+{skills.length - 5}</span>}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Badge variant="outline" className={`text-[10px] h-5 px-2 rounded-full font-medium shadow-none ${c.status === "Processed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>{c.status}</Badge>
        </div>
      </div>
    );
  };

  /* ── Download CSV handler ── */
  const handleDownloadCSV = async () => {
    try {
      const res = await fetch("/api/download-csv");
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

  /* ── Upload Button (rendered in DataTable header) ── */
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
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold
          shadow-sm border border-gray-200 bg-white text-gray-700
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
          active:scale-[0.97] transition-all duration-200 cursor-pointer select-none whitespace-nowrap"
      >
        <Download size={14} /> Export CSV
      </button>

      {/* Upload Resumes */}
      <button
        id="bulk-upload-btn"
        type="button"
        disabled={uploading}
        onClick={() => setIsUploadModalOpen(true)}
        className={`
          inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold
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
          <><Sparkles size={14} className="animate-pulse" /><Loader2 size={14} className="animate-spin" /> Processing with AI…</>
        ) : uploadSuccess ? (
          <><CheckCircle2 size={14} /> Done!</>
        ) : (
          <><Upload size={14} /> Upload Resumes</>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={candidates}
        isLoading={loading}
        title="Candidates"
        searchPlaceholder="Find..."
        mode="client"
        renderMobileCard={renderMobileCard}
        primaryAction={uploadAction}
      />

      {/* ── Advanced Upload Context Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-500" />
                  AI Resume Analysis
                </h2>
                <p className="text-xs text-gray-500 mt-1">Configure the context to generate accurate match scores.</p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Step 1: Expected Skills */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</div>
                  Expected Skills <span className="text-gray-400 font-normal ml-1">(Comma separated)</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g. React, Node.js, AWS, Figma"
                  value={expectedSkills}
                  onChange={(e) => setExpectedSkills(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-gray-300 transition-colors"
                />
                <p className="text-[11px] text-gray-500">The AI will intersect extracted skills with these to calculate the Match Score.</p>
              </div>

              {/* Step 2: Select Files */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</div>
                  Upload Resumes
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={18} className="text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Click to browse files (PDFs)</span>
                  {selectedFiles.length > 0 && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md mt-1">
                      {selectedFiles.length} file(s) selected
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
              >
                {uploading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing AI...</>
                ) : (
                  <>Process Resumes <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Toast ── */}
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

