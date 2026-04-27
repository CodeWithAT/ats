import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutGrid, Briefcase, Users, Settings,
  Menu, Search, ChevronsUpDown, LogOut, User, ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

import Logo from "@/assets/logo.svg?react";

const sidebarItems = [
  { name: "Overview", path: "/overview", icon: LayoutGrid },
  { name: "Jobs", path: "/jobs", icon: Briefcase },
  { name: "Candidates", path: "/candidates", icon: Users },
  { name: "Settings", path: "/settings", icon: Settings },
];

/* ── User Dropdown Menu ── */
function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="w-full justify-between px-2 h-10 hover:bg-gray-200/50"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-black text-white text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-[13px] font-medium text-gray-800 leading-tight">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[130px]">
              {user?.email || ""}
            </span>
          </div>
        </div>
        <ChevronsUpDown size={14} className="text-gray-400 shrink-0" />
      </Button>

      {open && (
        <div className="absolute bottom-12 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 py-1">
          <button
            onClick={() => { setOpen(false); navigate("/settings"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={14} className="text-gray-400" />
            <span>Profile & Settings</span>
            <ChevronRight size={12} className="ml-auto text-gray-300" />
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Sidebar Content ── */
const SidebarContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = sidebarItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "f" || e.key === "F") &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        document.getElementById("sidebar-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-[100dvh] md:h-full flex-col bg-[#F9F9F9] text-sm overflow-hidden border-r border-gray-200">
      <div className="h-14 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2 text-black cursor-pointer">
          <Logo className="h-5 w-5" />
          <span className="font-semibold text-[14px]">APTO Solution</span>
        </div>
      </div>

      <div className="px-3 pb-2 pt-1 shrink-0">
        <div className="relative flex items-center bg-white border border-gray-200 rounded-md px-2 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all h-8">
          <Search size={14} className="text-gray-400 shrink-0" />
          <Input
            id="sidebar-search"
            type="text"
            placeholder="Find..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 border-0 bg-transparent outline-none text-[13px] focus-visible:ring-0 shadow-none px-0 h-full"
          />
          <span className="text-[10px] text-gray-500 font-mono bg-gray-100 border border-gray-200 px-1.5 rounded ml-2 hidden lg:block">F</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <nav className="flex flex-col gap-0.5 p-2 pb-6">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full justify-between px-2 py-1.5 h-auto font-normal transition-colors ${
                    isActive
                      ? "bg-[#EAEAEA] text-black font-medium hover:bg-[#EAEAEA]"
                      : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-black" : "text-gray-500"} />
                    <span className="text-[13px]">{item.name}</span>
                  </div>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* User section at bottom */}
      <div className="mt-auto shrink-0 border-t border-gray-200 bg-[#F9F9F9] px-2 py-2">
        <UserMenu />
      </div>
    </div>
  );
};

export default function DashboardLayout() {
  return (
    <div className="flex h-[100dvh] w-full flex-col md:flex-row bg-white overflow-hidden">
      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between border-b border-gray-200 bg-[#F9F9F9] px-4 shrink-0">
        <div className="flex items-center gap-2 text-black">
          <Logo className="h-5 w-5" />
          <span className="font-semibold text-[14px]">APTO Solution</span>
        </div>
        <Sheet>
          <SheetTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-200 transition-colors">
            <Menu className="h-5 w-5 text-gray-800" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[240px] p-0 border-none [&>button]:hidden"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:flex w-[240px] flex-col bg-[#F9F9F9] border-r border-gray-200 text-sm h-full shrink-0 z-50">
        <SidebarContent />
      </aside>

      <main className="flex-1 bg-[#FAFAFA] h-full overflow-hidden flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}