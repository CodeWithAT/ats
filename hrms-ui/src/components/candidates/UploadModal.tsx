import { useRef } from "react";
import { Upload, Loader2, Sparkles, X, ChevronRight } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedSkills: string;
  onExpectedSkillsChange: (value: string) => void;
  selectedFiles: File[];
  onFileSelect: (files: File[]) => void;
  uploading: boolean;
  onConfirm: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  expectedSkills,
  onExpectedSkillsChange,
  selectedFiles,
  onFileSelect,
  uploading,
  onConfirm,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              AI Resume Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure the context to generate accurate match scores.
            </p>
          </div>
          <button
            onClick={onClose}
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
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                1
              </div>
              Expected Skills{" "}
              <span className="text-gray-400 font-normal ml-1">(Comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, AWS, Figma"
              value={expectedSkills}
              onChange={(e) => onExpectedSkillsChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-gray-300 transition-colors"
            />
            <p className="text-[11px] text-gray-500">
              The AI will intersect extracted skills with these to calculate the Match Score.
            </p>
          </div>

          {/* Step 2: Select Files */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                2
              </div>
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
              <span className="text-sm font-medium text-gray-700">
                Click to browse files (PDFs)
              </span>
              {selectedFiles.length > 0 && (
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md mt-1">
                  {selectedFiles.length} file(s) selected
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={selectedFiles.length === 0 || uploading}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing AI...
              </>
            ) : (
              <>
                Process Resumes <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
