import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard        from "../../components/StatCard";
import PageHeader      from "../../components/PageHeader";
import { formatDate }  from "../../components/EventCard";
import { Clock, CheckCircle, BarChart3, Calendar, ChevronRight } from "lucide-react";

export default function HoDDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events").then(r=>setAll(r.data)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const pending  = all.filter(e => e.status === "PENDING_HOD");
  const approved = all.filter(e => e.status === "APPROVED");
  const total    = all.length;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Head of Department" subtitle={`Welcome, ${user.name} — final approvals and overview`}/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Final Approval" value={pending.length}  icon={Clock}        color="amber"/>
        <StatCard label="Live Events"             value={approved.length} icon={CheckCircle}  color="emerald"/>
        <StatCard label="Total Events"            value={total}           icon={Calendar}     color="blue"/>
        <StatCard label="In Pipeline"             value={all.filter(e=>!["APPROVED","HOD_REJECTED","FACULTY_REJECTED","SDW_REJECTED"].includes(e.status)).length}
          icon={BarChart3} color="violet"/>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Awaiting Final Approval ({pending.length})
          </h2>
          <button onClick={() => navigate("/hod/approvals")} className="btn text-xs px-3 py-1.5">View All</button>
        </div>
        {loading ? <div className="text-sm text-slate-400">Loading…</div>
        : pending.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">No events awaiting your approval.</div>
        ) : (
          <div className="space-y-2">
            {pending.map(ev => (
              <button key={ev.id} onClick={() => navigate("/hod/approvals")}
                className="w-full glass-card p-4 flex items-center justify-between hover:shadow-md transition text-left">
                <div>
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {ev.clubName||"—"} · {formatDate(ev.startDate)}
                    {ev.estimatedBudget ? ` · ₹${ev.estimatedBudget.toLocaleString("en-IN")}` : ""}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0"/>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}