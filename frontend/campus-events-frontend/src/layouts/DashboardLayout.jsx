import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ActivityPanel from "../components/ActivityPanel";

export default function DashboardLayout({ children, onLogout }) {

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Navbar onLogout={onLogout} />

        <div className="flex flex-1 gap-6 p-6">

          <div className="flex-1 space-y-6">
            {children}
          </div>

          <div className="w-[320px]">
            <ActivityPanel />
          </div>

        </div>

      </div>

    </div>
  );
}