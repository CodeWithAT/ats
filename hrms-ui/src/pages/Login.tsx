import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

 
  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
   
    navigate("/overview"); 
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* Left */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-[#E5E5E5] bg-cover bg-center"
        style={{ backgroundImage: "url('/login_bg.png')" }}
      ></div>

      {/* Right Login */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8">
        <div className="w-full max-sm:max-w-xs max-w-sm flex flex-col gap-6">
          
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
                defaultValue="admin@apto.com"
                placeholder="m@example.com"
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
                defaultValue="apto_admin_secure123"
                className="h-10 bg-[#F3F4F6] border-none focus-visible:ring-1 focus-visible:ring-gray-400 shadow-none" 
              />
            </div>
          </div>

          <Button 
            onClick={handleLogin} 
            className="h-10 w-full bg-black text-white hover:bg-gray-800 font-bold shadow-sm"
          >
            Submit
          </Button>
          
        </div>
      </div>
      
    </div>
  );
}