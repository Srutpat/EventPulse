import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children, onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={user?.role} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}