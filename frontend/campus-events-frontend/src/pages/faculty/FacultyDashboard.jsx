import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import StatCard          from "../../components/StatCard";
import PageHeader        from "../../components/PageHeader";
import { formatDate }    from "../../components/EventCard";
import { Clock, CheckCircle, XCircle, BarChart3, ChevronRight } from "lucide-react";

export default function FacultyDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [pending,   setPending]   = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/events/pending/faculty"),
      api.get("/events"),
    ]).then(([p, all]) => {
      setPending(p.data);
      setAllEvents(all.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approved = allEvents.filter(e => e.status === "FACULTY_APPROVED" || e.status === "APPROVED" || e.status === "PENDING_SDW" || e.status === "SDW_APPROVED" || e.status === "PENDING_HOD").length;
  const rejected = allEvents.filter(e => e.status === "FACULTY_REJECTED").length;
  const total    = allEvents.length;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Faculty Advisor" subtitle={`Welcome, ${user.name} — review and approve events`}/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Review"    value={pending.length} icon={Clock}        color="amber"/>
        <StatCard label="Approved by You"   value={approved}       icon={CheckCircle}  color="emerald"/>
        <StatCard label="Rejected by You"   value={rejected}       icon={XCircle}      color="red"/>
        <StatCard label="Total Events"      value={total}          icon={BarChart3}    color="blue"/>
      </div>

      {/* Pending queue */}
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Awaiting Your Review ({pending.length})
          </h2>
          <button onClick={() => navigate("/faculty/approvals")} className="btn text-xs px-3 py-1.5">
            View All
          </button>
        </div>

        {loading ? <div className="text-sm text-slate-400">Loading…</div>
        : pending.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">
            🎉 No events awaiting review right now.
          </div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0,5).map(ev => (
              <button key={ev.id} onClick={() => navigate("/faculty/approvals")}
                className="w-full glass-card p-4 flex items-center justify-between gap-4 hover:shadow-md transition text-left">
                <div>
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {ev.clubName || "No club"} · {formatDate(ev.startDate)}
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