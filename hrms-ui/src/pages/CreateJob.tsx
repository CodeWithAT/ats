import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { useJobs, type Job } from "@/context/JobsContext";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addJob, updateJob, deleteJob } = useJobs();

  const jobToEdit = location.state?.jobToEdit as Job | undefined;

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDepartment, setNewJobDepartment] = useState("General");
  const [newJobType, setNewJobType] = useState<Job["type"]>("Full-time");
  const [newJobLocation, setNewJobLocation] = useState<Job["location"]>("Remote");
  const [newJobStatus, setNewJobStatus] = useState<Job["status"]>("Active");
  const [jdContent, setJdContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (jobToEdit) {
      setNewJobTitle(jobToEdit.title);
      setNewJobDepartment(jobToEdit.department);
      setNewJobLocation(jobToEdit.location);
      setNewJobType(jobToEdit.type);
      setNewJobStatus(jobToEdit.status);
      setJdContent(jobToEdit.description || "");
    }
  }, [jobToEdit]);

  const handleSaveJob = async () => {
    if (!newJobTitle.trim()) {
      setError("Job Title is required!");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (jobToEdit?.id) {
        await updateJob(jobToEdit.id, {
          title: newJobTitle,
          department: newJobDepartment,
          location: newJobLocation,
          type: newJobType,
          status: newJobStatus,
          description: jdContent,
        });
      } else {
        await addJob({
          title: newJobTitle,
          department: newJobDepartment,
          status: newJobStatus,
          type: newJobType,
          location: newJobLocation,
          description: jdContent,
        });
      }
      navigate("/jobs");
    } catch {
      setError("Failed to save job. Please try again.");
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToEdit?.id) return;
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    setIsDeleting(true);
    setError("");
    try {
      await deleteJob(jobToEdit.id);
      navigate("/jobs");
    } catch {
      setError("Failed to delete job. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white absolute inset-0">
      <div className="shrink-0 bg-white px-4 lg:px-10 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] min-h-[72px]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/jobs")} className="text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-[20px] font-semibold tracking-tight text-gray-900 shrink-0">
            {jobToEdit ? "Edit Job Details" : "Post a New Job"}
          </h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-4 lg:px-10 py-6 bg-gray-50/30">
        <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col min-h-0">
          <div className="flex flex-col flex-1 w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-auto relative p-6 lg:p-8">
            <div className="max-w-[1000px] w-full mx-auto">

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Job Title</label>
                    <input
                      type="text"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Department</label>
                    <select
                      value={newJobDepartment}
                      onChange={(e) => setNewJobDepartment(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      {["General","Engineering","Design","Marketing","HR","Sales","Finance"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select
                      value={newJobStatus}
                      onChange={(e) => setNewJobStatus(e.target.value as Job["status"])}
                      className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Employment Type</label>
                    <select
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value as Job["type"])}
                      className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Location Type</label>
                    <select
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value as Job["location"])}
                      className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Job Description (JD)</label>
                  <TiptapEditor content={jdContent} onChange={(html) => setJdContent(html)} />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    {jobToEdit && (
                      <button
                        onClick={handleDeleteJob}
                        disabled={saving || isDeleting}
                        className="px-4 py-1.5 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete Job
                      </button>
                    )}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => navigate("/jobs")}
                      disabled={saving || isDeleting}
                      className="px-4 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveJob}
                      disabled={saving || isDeleting}
                      className="px-4 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      {jobToEdit ? "Update Job" : "Save & Publish"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
