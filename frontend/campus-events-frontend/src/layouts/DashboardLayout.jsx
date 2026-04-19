import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children, onLogout }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f8]">
      <Sidebar role={user.role} onLogout={onLogout}/>

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100
          px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-600">EventPulse</span>
            <span>/</span>
            <span>{user.role?.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
              flex items-center justify-center text-white text-xs font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}