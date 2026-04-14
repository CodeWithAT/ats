import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { useJobs, type Job } from "@/context/JobsContext";
import { ArrowLeft } from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addJob, updateJob } = useJobs();

  const jobToEdit = location.state?.jobToEdit as Job | undefined;

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDepartment, setNewJobDepartment] = useState("General");
  const [newJobLocation, setNewJobLocation] = useState("Remote");
  const [jdContent, setJdContent] = useState("");

  useEffect(() => {
    if (jobToEdit) {
      setNewJobTitle(jobToEdit.title);
      setNewJobDepartment(jobToEdit.department);
      setNewJobLocation(jobToEdit.location);
      setJdContent(jobToEdit.description || "");
    }
  }, [jobToEdit]);

  const handleSaveJob = () => {
    if (newJobTitle.trim() === "") {
      alert("Job Title is required!");
      return;
    }

    if (jobToEdit && jobToEdit.id) {
      updateJob(jobToEdit.id, {
        title: newJobTitle,
        department: newJobDepartment,
        location: newJobLocation as Job["location"],
        description: jdContent,
      });
    } else {
      const newJob: Job = {
        id: Math.random().toString(36).substring(2, 9),
        title: newJobTitle,
        department: newJobDepartment,
        status: "Active",
        type: "Full-time",
        location: newJobLocation as Job["location"],
        applicants: 0,
        postedDate: "Just now",
        description: jdContent,
      };
      addJob(newJob);
    }
    navigate("/jobs");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white absolute inset-0">
      {/* Header bar — matches DashboardLayout / DataTable header exactly */}
      <div className="shrink-0 bg-white px-4 lg:px-10 pt-4 pb-2 border-b border-gray-100 flex flex-row items-center gap-3 w-full z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => navigate("/jobs")}
          className="text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[20px] font-semibold tracking-tight text-gray-900 shrink-0">
          {jobToEdit ? "Edit Job Details" : "Post a New Job"}
        </h2>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-4 lg:px-10 py-6 bg-gray-50/30">
        <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col min-h-0">
          <div className="flex flex-col flex-1 w-full rounded-lg border border-gray-200 bg-white shadow-sm overflow-auto relative p-6 lg:p-8">
            <div className="max-w-[1000px] w-full mx-auto">

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
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
                  <option value="General">General</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Location Type</label>
                <select
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
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
              <TiptapEditor
                content={jdContent}
                onChange={(html) => setJdContent(html)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => navigate("/jobs")}
                className="px-4 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                className="px-4 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm transition-colors"
              >
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
