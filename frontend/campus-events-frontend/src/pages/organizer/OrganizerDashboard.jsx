import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard        from "../../components/StatCard";
import PageHeader      from "../../components/PageHeader";
import WorkflowBadge   from "../../components/WorkflowBadge";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import { STATUS_META }  from "../../constants";
import { Calendar, Clock, CheckCircle, PlusCircle, ChevronRight, IndianRupee, FileText, Trash2 } from "lucide-react";

export default function OrganizerDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get(`/events/organizer/${user.id}`)
      .then(r => setEvents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteEvent = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this event?")) return;
    setDeleting(id);
    try {
      await api.delete(`/events/${id}`);
      setEvents(p => p.filter(ev => ev.id !== id));
    } catch { alert("Cannot delete — it may have registrations."); }
    finally { setDeleting(null); }
  };

  const counts = {
    total:   events.length,
    pending: events.filter(e => ["PENDING_FACULTY","PENDING_SDW","PENDING_HOD"].includes(e.status)).length,
    approved:events.filter(e => e.status === "APPROVED").length,
    rejected:events.filter(e => ["FACULTY_REJECTED","SDW_REJECTED","HOD_REJECTED"].includes(e.status)).length,
  };

  // Action hint per status
  const actionHint = (ev) => {
    if (ev.status === "FACULTY_APPROVED") return { label:"Submit Budget →", path:`/organizer/budget/${ev.id}`, color:"btn" };
    if (ev.status === "APPROVED")         return { label:"Post-Event Report", path:`/organizer/report/${ev.id}`, color:"btn-outline" };
    if (["FACULTY_REJECTED","SDW_REJECTED","HOD_REJECTED"].includes(ev.status))
      return { label:"Edit & Resubmit", path:`/organizer/edit/${ev.id}`, color:"btn" };
    return null;
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Organizer Dashboard" subtitle={`Manage your events, ${user.name}`}>
        <button onClick={() => navigate("/organizer/create")} className="btn flex items-center gap-2">
          <PlusCircle size={16}/> Create Event
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events"  value={counts.total}    icon={Calendar}     color="blue"/>
        <StatCard label="In Progress"   value={counts.pending}  icon={Clock}        color="amber"/>
        <StatCard label="Live Events"   value={counts.approved} icon={CheckCircle}  color="emerald"/>
        <StatCard label="Need Changes"  value={counts.rejected} icon={FileText}     color="red"/>
      </div>

      {/* Events list */}
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Events</h2>

      {loading ? (
        <div className="text-center text-slate-400 mt-16 text-sm">Loading…</div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-slate-500 mb-4">No events yet. Create your first one!</p>
          <button onClick={() => navigate("/organizer/create")} className="btn">+ Create Event</button>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {events.map(ev => {
            const meta   = STATUS_META[ev.status] || {label:ev.status, color:"badge-gray"};
            const action = actionHint(ev);
            return (
              <div key={ev.id}
                onClick={() => setSelected(ev)}
                className="glass-card p-4 cursor-pointer hover:shadow-md transition-all duration-200
                  hover:-translate-y-0.5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${meta.color}`}>{meta.label}</span>
                      {ev.clubName && <span className="badge badge-violet">{ev.clubName}</span>}
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
                        : "—"}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                    {/* Mini workflow */}
                    <div className="mt-3">
                      <WorkflowBadge status={ev.status}/>
                    </div>
                    {/* Reviewer comment */}
                    {(ev.facultyComment || ev.sdwComment || ev.hodComment) &&
                     ["FACULTY_REJECTED","SDW_REJECTED","HOD_REJECTED"].includes(ev.status) && (
                      <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2">
                        <p className="text-xs text-red-600 font-medium">Feedback:</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {ev.facultyComment || ev.sdwComment || ev.hodComment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition"/>
                    {action && (
                      <button
                        onClick={e => { e.stopPropagation(); navigate(action.path); }}
                        className={`${action.color} text-xs px-3 py-1.5 whitespace-nowrap`}>
                        {action.label}
                      </button>
                    )}
                    {["PENDING_FACULTY","FACULTY_REJECTED"].includes(ev.status) && (
                      <button
                        onClick={e => deleteEvent(ev.id, e)}
                        disabled={deleting === ev.id}
                        className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                        <Trash2 size={11}/>{deleting===ev.id?"…":"Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <EventDetailDrawer event={selected} onClose={() => setSelected(null)} showBudget={true}/>
      )}
    </DashboardLayout>
  );
}