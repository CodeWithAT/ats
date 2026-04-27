import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } else {
        setError(data.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white relative">
      {/* Left Banner */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-[#E5E5E5] bg-cover bg-center"
        style={{ backgroundImage: "url('/login_bg.png')" }}
      >
        <div className="flex items-center justify-center h-full bg-black/10 backdrop-blur-[2px]">
          {/* Optional overlay text/branding */}
        </div>
      </div>

      {/* Right Register Container */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8">
        <form onSubmit={handleRegister} className="w-full max-sm:max-w-xs max-w-sm flex flex-col gap-6">
          
          <div className="flex flex-col gap-1 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create an account</h1>
            <p className="text-sm text-gray-500">Sign up to get started as an Admin</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
              <CheckCircle2 size={16} />
              <p>{success}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label 
                htmlFor="name" 
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Full Name
              </Label>
              <Input 
                id="name"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="h-10 bg-[#F3F4F6] border-none focus-visible:ring-1 focus-visible:ring-gray-400 shadow-none placeholder:text-gray-400" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Email
              </Label>
              <Input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className="h-10 bg-[#F3F4F6] border-none focus-visible:ring-1 focus-visible:ring-gray-400 shadow-none placeholder:text-gray-400" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Password
              </Label>
              <Input 
                id="password"
                type="password" 
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="h-10 bg-[#F3F4F6] border-none focus-visible:ring-1 focus-visible:ring-gray-400 shadow-none placeholder:text-gray-400" 
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || !!success}
            className="h-10 w-full bg-black text-white hover:bg-gray-800 font-bold shadow-sm transition-all"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating account..." : "Sign up"}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Sign in
            </Link>
          </p>
          
        </form>
      </div>
    </div>
  );
}
