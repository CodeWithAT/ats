import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // Fetch real user data with the token
        const meRes = await fetch("/auth/me", {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        
        if (meRes.ok) {
          const meData = await meRes.json();
          login(data.token, meData.user);
          navigate("/overview", { replace: true });
        } else {
          setError("Failed to fetch user profile.");
        }
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
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

      {/* Right Login Container */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8">
        <form onSubmit={handleLogin} className="w-full max-sm:max-w-xs max-w-sm flex flex-col gap-6">
          
          <div className="flex flex-col gap-1 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your ATS Dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
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
              <div className="flex justify-between items-center">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Password
                </Label>
                <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Forgot password?
                </a>
              </div>
              <Input 
                id="password"
                type="password" 
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-[#F3F4F6] border-none focus-visible:ring-1 focus-visible:ring-gray-400 shadow-none" 
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="h-10 w-full bg-black text-white hover:bg-gray-800 font-bold shadow-sm transition-all"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-black hover:underline">
              Sign up
            </Link>
          </p>
          
        </form>
      </div>
    </div>
  );
}