import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard        from "../../components/StatCard";
import PageHeader      from "../../components/PageHeader";
import { safeArray, getStatus, formatDateTime, filterForHoD } from "../../utils";
import { Clock, CheckCircle, Calendar, BarChart3, ChevronRight } from "lucide-react";

export default function HoDDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events")
      .then(r => {
        const all     = safeArray(r.data);
        const visible = filterForHoD(all, user.department);
        setEvents(visible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending  = events.filter(e => getStatus(e) === "PENDING_HOD");
  const approved = events.filter(e => getStatus(e) === "APPROVED");
  const pipeline = events.filter(e =>
    !["APPROVED","HOD_REJECTED","FACULTY_REJECTED","SDW_REJECTED"].includes(getStatus(e))
  );

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Head of Department"
        subtitle={user.department
          ? `Final approvals — ${user.department} dept`
          : `Final approvals — all departments`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Awaiting You"   value={pending.length}  icon={Clock}        color="amber"/>
        <StatCard label="Live Events"    value={approved.length} icon={CheckCircle}  color="emerald"/>
        <StatCard label="Total"          value={events.length}   icon={Calendar}     color="blue"/>
        <StatCard label="In Pipeline"    value={pipeline.length} icon={BarChart3}    color="violet"/>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Awaiting Final Approval ({pending.length})
          </h2>
          <button onClick={() => navigate("/hod/approvals")} className="btn text-xs px-3 py-1.5">
            View All
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="skeleton h-16 rounded-2xl"/>)}
          </div>
        ) : pending.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <CheckCircle size={36} className="text-emerald-300 mx-auto mb-3"/>
            <p className="font-semibold text-slate-500">No events awaiting approval.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((ev, i) => (
              <button key={ev.id} onClick={() => navigate("/hod/approvals")}
                style={{ animationDelay:`${i*60}ms` }}
                className="w-full glass-card px-4 py-3 flex items-center justify-between
                  hover:shadow-md transition-all text-left group animate-[fadeSlideUp_0.3s_ease_both]">
                <div>
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {ev.clubName || "—"} · {formatDateTime(ev.startDate || ev.eventDate)}
                    {ev.estimatedBudget ? ` · ₹${ev.estimatedBudget.toLocaleString("en-IN")}` : ""}
                  </p>
                </div>
                <ChevronRight size={16}
                  className="text-slate-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0"/>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}