import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, Loader2, CheckCircle2, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!name.trim()) { setError("Name cannot be empty."); return; }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          ...(newPassword ? { currentPassword, newPassword } : {})
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSuccess("Profile updated successfully!");
      if (token && data.user) {
        // useAuth login() actually just updates user & token in context
        // We reuse it here to refresh the UI
        login(token, data.user);
      }
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white absolute inset-0">
      {/* Header */}
      <div className="shrink-0 bg-white px-4 lg:px-10 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] min-h-[72px]">
        <h2 className="text-[20px] font-semibold tracking-tight text-gray-900 shrink-0">Settings</h2>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/30 px-4 lg:px-10 py-6">
        <div className="max-w-[720px] mx-auto space-y-5">

          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-[20px] font-bold shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-gray-900">{user?.name}</p>
                <p className="text-[13px] text-gray-500">{user?.email}</p>
                <span className="inline-flex mt-1 items-center gap-1.5 text-[11px] font-medium bg-black text-white px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700">
                <CheckCircle2 size={15} /> {success}
              </div>
            )}
            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <User size={13} className="text-gray-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed after registration.</p>
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={15} className="text-gray-400" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-[13px] font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-black text-white text-[13px] font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
