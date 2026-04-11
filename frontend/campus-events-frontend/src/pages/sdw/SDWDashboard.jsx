import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard        from "../../components/StatCard";
import PageHeader      from "../../components/PageHeader";
import { formatDate }  from "../../components/EventCard";
import { Clock, CheckCircle, IndianRupee, ChevronRight } from "lucide-react";

export default function SDWDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [pending, setPending]   = useState([]);
  const [all,     setAll]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.get("/events/pending/sdw"), api.get("/events")])
      .then(([p, a]) => { setPending(p.data); setAll(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approved = all.filter(e=>["SDW_APPROVED","PENDING_HOD","APPROVED"].includes(e.status)).length;
  const totalBudget = all.filter(e=>e.status==="APPROVED" && e.estimatedBudget)
    .reduce((s,e)=>s+(e.estimatedBudget||0), 0);

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="SDW Coordinator" subtitle={`Welcome, ${user.name} — review events and budgets`}/>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Review"  value={pending.length} icon={Clock}        color="amber"/>
        <StatCard label="Approved by You" value={approved}       icon={CheckCircle}  color="emerald"/>
        <StatCard label="Approved Budget" value={`₹${(totalBudget/1000).toFixed(0)}k`} icon={IndianRupee} color="blue"/>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Awaiting Your Review ({pending.length})
          </h2>
          <button onClick={() => navigate("/sdw/approvals")} className="btn text-xs px-3 py-1.5">View All</button>
        </div>
        {loading ? <div className="text-sm text-slate-400">Loading…</div>
        : pending.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">No events pending review.</div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0,5).map(ev => (
              <button key={ev.id} onClick={() => navigate("/sdw/approvals")}
                className="w-full glass-card p-4 flex items-center justify-between gap-4 hover:shadow-md transition text-left">
                <div>
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {formatDate(ev.startDate)}
                    {ev.estimatedBudget && ` · Budget: ₹${ev.estimatedBudget.toLocaleString("en-IN")}`}
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