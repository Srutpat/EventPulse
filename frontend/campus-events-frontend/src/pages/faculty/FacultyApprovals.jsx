import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout     from "../../layouts/DashboardLayout";
import PageHeader          from "../../components/PageHeader";
import ApprovalModal       from "../../components/ApprovalModal";
import EventDetailDrawer   from "../../components/EventDetailDrawer";
import WorkflowBadge       from "../../components/WorkflowBadge";
import { formatDate }      from "../../components/EventCard";
import { Eye, CheckCircle } from "lucide-react";

const TABS = [
  {key:"PENDING_FACULTY",  label:"Pending"},
  {key:"FACULTY_APPROVED", label:"Approved"},
  {key:"FACULTY_REJECTED", label:"Rejected"},
];

export default function FacultyApprovals({ onLogout }) {
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("PENDING_FACULTY");
  const [modal,    setModal]    = useState(null);  // event being actioned
  const [drawer,   setDrawer]   = useState(null);  // event shown in drawer
  const [actioning,setActioning]= useState(false);

  const load = () => {
    api.get("/events").then(r => setEvents(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = events.filter(e => e.status === tab);
  const count    = s => events.filter(e => e.status === s).length;

  const handleAction = async ({ action, comment }) => {
    setActioning(true);
    try {
      await api.post(`/events/${modal.id}/faculty-review`, { action, comment });
      setEvents(prev => prev.map(e => e.id === modal.id
        ? { ...e, status: action === "APPROVE" ? "FACULTY_APPROVED" : "FACULTY_REJECTED",
            facultyComment: comment }
        : e
      ));
      setModal(null);
    } catch (err) {
      alert(err.response?.data || "Action failed.");
    } finally { setActioning(false); }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Event Approvals" subtitle="Review events submitted by organizers"/>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({key, label}) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
              ${tab===key ? "bg-violet-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {label}
            {count(key) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs
                ${tab===key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {count(key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-slate-400 mt-16 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-400 text-sm">No events in this category.</div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {filtered.map(ev => (
            <div key={ev.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {ev.clubName || "—"} · {formatDate(ev.startDate || ev.eventDate)}
                  </p>
                  {ev.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.description}</p>
                  )}
                  {ev.facultyComment && tab !== "PENDING_FACULTY" && (
                    <div className="mt-2 bg-slate-50 rounded-lg p-2 text-xs text-slate-500">
                      💬 {ev.facultyComment}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setDrawer(ev)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
                    <Eye size={13}/> Details
                  </button>
                  {tab === "PENDING_FACULTY" && (
                    <button onClick={() => setModal(ev)}
                      className="btn text-xs px-3 py-1.5 flex items-center gap-1">
                      <CheckCircle size={13}/> Review
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <WorkflowBadge status={ev.status}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ApprovalModal
          eventTitle={modal.title}
          onClose={() => setModal(null)}
          onSubmit={handleAction}
          loading={actioning}
        />
      )}
      {drawer && (
        <EventDetailDrawer event={drawer} onClose={() => setDrawer(null)} showBudget={false}/>
      )}
    </DashboardLayout>
  );
}