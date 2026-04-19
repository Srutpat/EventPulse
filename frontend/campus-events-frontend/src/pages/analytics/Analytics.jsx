import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import StatCard        from "../../components/StatCard";
import { safeArray, getStatus } from "../../utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  TrendingUp, Calendar, Users, IndianRupee,
  CheckCircle, Clock, BarChart3, Award
} from "lucide-react";
import { isUnderScrutiny, isFinalApproved, isRejected } from "../../utils";
const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#14b8a6"];

const STATUS_LABELS = {
  PENDING_FACULTY: "Pending Faculty",
  PENDING_SDW:     "Pending SDW",
  PENDING_HOD:     "Pending HoD",
  APPROVED:        "Approved",
  FACULTY_REJECTED:"Faculty Rejected",
  SDW_REJECTED:    "SDW Rejected",
  HOD_REJECTED:    "HoD Rejected",
};

export default function Analytics({ onLogout }) {
  const [events,    setEvents]    = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [evRes, anaRes] = await Promise.all([
          api.get("/events"),
          api.get("/events/analytics"),
        ]);
        setEvents(safeArray(evRes.data));
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Analytics" subtitle="Loading insights…"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl"/>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-64 rounded-2xl"/>)}
      </div>
    </DashboardLayout>
  );

  // ── Compute chart data from events ──────────────────────────────────────────
  const approved = events.filter(isFinalApproved);
const pending  = events.filter(isUnderScrutiny);
const rejected = events.filter(isRejected);
  const withReport= events.filter(e => e.eventReport);

  // Status pie chart data
  const statusData = Object.entries(
    events.reduce((acc, e) => {
      const s = getStatus(e) || "UNKNOWN";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v }));

  // Department bar chart
  const deptData = Object.entries(
    events.reduce((acc, e) => {
      const d = e.department || "Central/Other";
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {})
  ).map(([dept, count]) => ({ dept: dept.length > 12 ? dept.substring(0,10)+"…" : dept, count }))
   .sort((a, b) => b.count - a.count);

  // Category pie
  const catData = Object.entries(
    events.reduce((acc, e) => {
      if (e.category) acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([k, v]) => ({ name: k, value: v }))
   .sort((a, b) => b.value - a.value);

  // Monthly trend (last 6 months)
  const monthlyData = (() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-IN", { month:"short", year:"2-digit" });
      months[key] = { month: key, created: 0, approved: 0 };
    }
    events.forEach(e => {
      const d = new Date(e.createdAt || e.startDate || e.eventDate);
      if (isNaN(d)) return;
      const key = d.toLocaleString("en-IN", { month:"short", year:"2-digit" });
      if (months[key]) {
        months[key].created++;
        if (isFinalApproved(e)) months[key].approved++;
      }
    });
    return Object.values(months);
  })();

  // Budget stats
  const budgetEvents = events.filter(e => e.estimatedBudget);
  const totalBudget  = budgetEvents.reduce((s, e) => s + (e.estimatedBudget || 0), 0);
  const avgBudget    = budgetEvents.length ? Math.round(totalBudget / budgetEvents.length) : 0;

  // Approval rate
  const approvalRate = events.length
    ? Math.round((approved.length / events.length) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card px-3 py-2 text-xs shadow-xl border border-slate-200">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="EventPulse Analytics"
        subtitle="Real-time insights across the entire event lifecycle"/>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events"    value={events.length}               icon={Calendar}    color="indigo"/>
        <StatCard label="Live Right Now"  value={approved.length}             icon={CheckCircle} color="emerald"
          sub={`${approvalRate}% approval rate`}/>
        <StatCard label="In Pipeline"     value={pending.length}              icon={Clock}       color="amber"/>
        <StatCard label="Total Budget"    value={`₹${(totalBudget/1000).toFixed(0)}k`} icon={IndianRupee} color="violet"
          sub={`Avg ₹${(avgBudget/1000).toFixed(0)}k per event`}/>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly trend */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-indigo-500"/>
            <h3 className="font-bold text-slate-800">Event Activity (Last 6 Months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="approved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:11}} stroke="#94a3b8"/>
              <YAxis tick={{fontSize:11}} stroke="#94a3b8"/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend/>
              <Area type="monotone" dataKey="created"  name="Created"  stroke="#6366f1" fill="url(#created)"  strokeWidth={2}/>
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#10b981" fill="url(#approved)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Events by department */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-violet-500"/>
            <h3 className="font-bold text-slate-800">Events by Department</h3>
          </div>
          {deptData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:11}} stroke="#94a3b8"/>
                <YAxis type="category" dataKey="dept" tick={{fontSize:10}} stroke="#94a3b8" width={80}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" name="Events" radius={[0,4,4,0]}>
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Award size={18} className="text-emerald-500"/>
            <h3 className="font-bold text-slate-800">Approval Pipeline Status</h3>
          </div>
          {statusData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" nameKey="name" label={({name,percent})=>`${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconSize={10} iconType="circle"
                  formatter={(v) => <span style={{fontSize:11}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Event categories */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={18} className="text-cyan-500"/>
            <h3 className="font-bold text-slate-800">Events by Category</h3>
          </div>
          {catData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="name" tick={{fontSize:10}} stroke="#94a3b8"/>
                <YAxis tick={{fontSize:11}} stroke="#94a3b8"/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" name="Events" radius={[4,4,0,0]}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Quick insights */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Most Active Club</p>
          <p className="font-bold text-slate-800 text-lg">
            {(() => {
              const clubs = events.reduce((a, e) => { if (e.clubName) a[e.clubName] = (a[e.clubName]||0)+1; return a; }, {});
              const top = Object.entries(clubs).sort((a,b)=>b[1]-a[1])[0];
              return top ? `${top[0]} (${top[1]})` : "—";
            })()}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Post-Event Reports</p>
          <p className="font-bold text-slate-800 text-lg">{withReport.length} / {approved.length}</p>
          <p className="text-xs text-slate-400">of approved events have reports</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Rejection Rate</p>
          <p className={`font-bold text-lg ${rejected.length/Math.max(events.length,1) > 0.3 ? "text-red-500" : "text-emerald-600"}`}>
            {events.length ? Math.round((rejected.length / events.length) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400">{rejected.length} events rejected total</p>
        </div>
      </div>
    </DashboardLayout>
  );
}