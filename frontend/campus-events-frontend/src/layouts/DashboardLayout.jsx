import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children, onLogout }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f8]">

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:flex lg:shrink-0
        `}
      >
        <Sidebar
          role={user.role}
          onLogout={onLogout}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100
          px-4 sm:px-8 py-3 flex items-center justify-between gap-3">

          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-600">EventPulse</span>
            <span>/</span>
            <span className="hidden sm:inline">{user.role?.replace(/_/g, " ")}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
              flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block truncate max-w-[120px]">
              {user.name}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}