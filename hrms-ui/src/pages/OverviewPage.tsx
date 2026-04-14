import { useState, useEffect } from "react";
import { Users, Briefcase, Activity, CheckCircle2, XCircle, Sparkles, Wifi } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useJobs } from "@/context/JobsContext";

type SystemStatus = { online: boolean; message: string; candidateCount: number };

export default function OverviewPage() {
  const { jobs } = useJobs();
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetch("/api/system-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ online: false, message: "Cannot reach API server", candidateCount: 0 }));
  }, []);

  const activeJobs = jobs.filter((j) => j.status === "Active").length;

  const departmentCounts = jobs.reduce((acc, job) => {
    acc[job.department] = (acc[job.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(departmentCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#111827', '#4B5563', '#9CA3AF', '#D1D5DB', '#F3F4F6'];

  return (
    <div className="flex flex-col h-full w-full bg-white absolute inset-0">
      {/* Header bar — matches DataTable header exactly */}
      <div className="shrink-0 bg-white px-4 lg:px-10 pt-4 pb-2 border-b border-gray-100 flex flex-row items-center justify-between gap-3 w-full z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-[20px] font-semibold tracking-tight text-gray-900 shrink-0">Overview</h2>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/30 px-4 lg:px-10 py-6">
        <div className="max-w-[1600px] mx-auto space-y-5">

        {/* System Status */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all ${
          status?.online
            ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
            : status === null
            ? "bg-white border-gray-200 animate-pulse"
            : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            status?.online ? "bg-emerald-100" : status === null ? "bg-gray-200" : "bg-red-100"
          }`}>
            {status?.online ? <CheckCircle2 size={20} className="text-emerald-600" /> : status === null ? null : <XCircle size={20} className="text-red-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[15px] font-semibold ${status?.online ? "text-emerald-800" : "text-gray-800"}`}>
              {status?.message || "Checking system status..."}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Wifi size={11} className={status?.online ? "text-emerald-500" : "text-gray-400"} />
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                {status?.online ? "Backend connected to ats_database.db" : "Waiting for connection..."}
              </span>
            </div>
          </div>
          {status?.online && (
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Candidates",
              value: status?.candidateCount ?? "—",
              icon: <Users size={20} className="text-blue-500" />,
              bg: "bg-blue-50",
            },
            {
              label: "Active Jobs",
              value: activeJobs,
              icon: <Briefcase size={20} className="text-emerald-500" />,
              bg: "bg-emerald-50",
            },
            {
              label: "System Status",
              value: status?.online ? "Online" : "Offline",
              icon: <Activity size={20} className="text-violet-500" />,
              bg: "bg-violet-50",
            },
            {
              label: "ATS Engine",
              value: "v2.0",
              icon: <Sparkles size={20} className="text-amber-500" />,
              bg: "bg-amber-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[22px] font-bold text-gray-900 leading-tight">{stat.value}</p>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-3">How it works</h3>
            <ol className="space-y-2 text-[13px] text-gray-600">
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span> Drop resumes into <code className="bg-gray-100 px-1 rounded text-[11px]">resumes_to_process/</code></li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span> Run <code className="bg-gray-100 px-1 rounded text-[11px]">python main.py</code> to process</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span> View ranked candidates in the Candidates tab</li>
            </ol>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Current Job Postings</h3>
            <div className="space-y-2">
              {jobs.slice(0, 3).map((j) => (
                <div key={j.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-700 truncate">{j.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`h-1.5 w-1.5 rounded-full ${j.status === "Active" ? "bg-green-500" : j.status === "Draft" ? "bg-amber-400" : "bg-gray-400"}`} />
                    <span className="text-gray-500">{j.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          
          {/* Applicants Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Applicants per Job</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobs} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} 
                  />
                  <Bar dataKey="applicants" fill="#111827" barSize={36} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Jobs by Department</h3>
            <div className="h-[250px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} 
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-[24px] font-bold text-gray-900 leading-none">{jobs.length}</span>
                <span className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Jobs</span>
              </div>
            </div>
          </div>

        </div>

      </div>
      </div>
    </div>
  );
}
