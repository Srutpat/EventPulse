import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard        from "../../components/StatCard";
import PageHeader      from "../../components/PageHeader";
import { safeArray, getStatus, formatDateTime } from "../../utils";
import { Clock, CheckCircle, XCircle, BarChart3, ChevronRight } from "lucide-react";

export default function FacultyDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events")
      .then(r => {
        const all = safeArray(r.data);
        // Faculty sees events of their clubs only (clubNames is comma-separated)
        // If no clubNames set, show all (fallback for older accounts)
        const myClubs = user.clubNames
          ? user.clubNames.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
          : user.clubName
            ? [user.clubName.trim().toLowerCase()]
            : [];
        const visible = myClubs.length === 0
          ? all
          : all.filter(e => e.clubName && myClubs.includes(e.clubName.trim().toLowerCase()));
        setEvents(visible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending  = events.filter(e => getStatus(e) === "PENDING_FACULTY");
  const approved = events.filter(e => ["FACULTY_APPROVED","PENDING_SDW","SDW_APPROVED","PENDING_HOD","APPROVED"].includes(getStatus(e)));
  const rejected = events.filter(e => getStatus(e) === "FACULTY_REJECTED");

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title={`Hello, ${user.name} 👋`}
        subtitle={user.clubNames || user.clubName
          ? `Faculty Advisor — ${user.clubNames || user.clubName}`
          : "Faculty Advisor"}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Review"  value={pending.length}  icon={Clock}        color="amber"/>
        <StatCard label="Approved"        value={approved.length} icon={CheckCircle}  color="emerald"/>
        <StatCard label="Rejected"        value={rejected.length} icon={XCircle}      color="red"/>
        <StatCard label="Total"           value={events.length}   icon={BarChart3}    color="indigo"/>
      </div>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Awaiting Your Review ({pending.length})
          </h2>
          <button onClick={() => navigate("/faculty/approvals")} className="btn text-xs px-3 py-1.5">
            View All
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl"/>)}</div>
        ) : pending.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <CheckCircle size={36} className="text-emerald-300 mx-auto mb-3"/>
            <p className="font-semibold text-slate-500">All caught up!</p>
            <p className="text-sm text-slate-400 mt-1">No events waiting for your review.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((ev, i) => (
              <button key={ev.id} onClick={() => navigate("/faculty/approvals")}
                style={{ animationDelay:`${i*60}ms` }}
                className="w-full glass-card px-4 py-3 flex items-center justify-between hover:shadow-md transition-all text-left group animate-[fadeSlideUp_0.3s_ease_both]">
                <div>
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name || "—"} · {ev.clubName || "No club"} · {formatDateTime(ev.startDate || ev.eventDate)}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0"/>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}