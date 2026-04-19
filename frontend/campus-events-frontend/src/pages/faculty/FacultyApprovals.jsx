import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import PageHeader        from "../../components/PageHeader";
import ApprovalModal     from "../../components/ApprovalModal";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import WorkflowBadge     from "../../components/WorkflowBadge";
import { safeArray, getStatus, formatDateTime, isCentralEvent } from "../../utils";
import { Eye, CheckCircle, ArrowRight, Info, Phone, Calendar, MapPin } from "lucide-react";

const TABS = [
  { key:"PENDING_FACULTY",  label:"Pending Review" },
  { key:"FACULTY_APPROVED", label:"Approved"       },
  { key:"FACULTY_REJECTED", label:"Rejected"       },
];

function parseCoords(ev) {
  if (ev.coordinatorsJson) {
    try {
      const p = JSON.parse(ev.coordinatorsJson);
      if (Array.isArray(p) && p.length) return p;
    } catch (_) {}
  }
  if (ev.coordinatorName) return [{ name: ev.coordinatorName, contact: ev.coordinatorContact || "" }];
  return [];
}

export default function FacultyApprovals({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Parse the faculty's club list from comma-separated string
  const myClubs = (user.clubNames || user.clubName || "")
    .split(",")
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("PENDING_FACULTY");
  const [modal,      setModal]      = useState(null);
  const [drawer,     setDrawer]     = useState(null);
  const [actioning,  setActioning]  = useState(false);
  const [forwarding, setForwarding] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get("/events")
      .then(r => {
        const all = safeArray(r.data);
        // Faculty sees ONLY events of their assigned clubs
        const visible = myClubs.length === 0
          ? all  // no clubs configured → fallback show all
          : all.filter(e =>
              e.clubName && myClubs.includes(e.clubName.trim().toLowerCase())
            );
        setEvents(visible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateEvent = (updated) =>
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));

  const filtered = events.filter(e => getStatus(e) === tab);
  const count    = s => events.filter(e => getStatus(e) === s).length;

  const handleAction = async ({ action, comment }) => {
    setActioning(true);
    try {
      const res = await api.post(`/events/${modal.id}/faculty-review`, { action, comment });
      updateEvent(res.data);
      setModal(null);
    } catch (err) {
      alert(err.response?.data || "Action failed.");
    } finally { setActioning(false); }
  };

  // Central events (NSS etc) bypass dept SDW → go directly to SDW Dean
  const forwardToDean = async (ev) => {
    setForwarding(ev.id);
    try {
      const res = await api.post(`/events/${ev.id}/forward-dean`);
      updateEvent(res.data);
    } catch (err) {
      alert(err.response?.data || "Failed to forward.");
    } finally { setForwarding(null); }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Event Approvals"
        subtitle={myClubs.length > 0
          ? `Showing events for: ${myClubs.join(", ")}`
          : "All events (no clubs configured)"}
      />

      {myClubs.length > 0 && (
        <div className="glass-card p-3 mb-5 max-w-3xl flex items-start gap-3 bg-indigo-50/60 border-indigo-100">
          <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700">
            You only see events from <strong>{myClubs.join(", ")}</strong>.
            Events from other clubs are handled by their respective Faculty Advisors.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
            {label}
            {count(key) > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold
                ${tab === key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>
                {count(key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 max-w-3xl">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-3xl">
          <CheckCircle size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            {tab === "PENDING_FACULTY" ? "No events pending your review." : "No events here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filtered.map((ev, i) => {
            const coords  = parseCoords(ev);
            const central = isCentralEvent(ev);
            return (
              <div key={ev.id}
                style={{ animationDelay:`${i*50}ms` }}
                className="glass-card p-5 animate-[fadeSlideUp_0.3s_ease_both]">

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800">{ev.title}</h3>
                      {ev.clubName && <span className="badge badge-violet">{ev.clubName}</span>}
                      {central
                        ? <span className="badge badge-indigo">🏫 College-Level</span>
                        : ev.department && <span className="badge badge-blue">{ev.department}</span>}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {formatDateTime(ev.startDate || ev.eventDate)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {ev.location}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      By <span className="font-semibold text-slate-600">{ev.organizer?.name}</span>
                    </p>

                    {ev.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.description}</p>
                    )}

                    {/* Coordinator tags */}
                    {coords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {coords.map((c, ci) => (
                          <span key={ci} className="flex items-center gap-1 text-xs
                            bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                            <Phone size={10} className="text-slate-400" />
                            <span className="font-medium">{c.name}</span>
                            {c.contact && <span className="text-slate-400">· {c.contact}</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Budget */}
                    {ev.estimatedBudget > 0 && (
                      <p className="text-xs text-emerald-700 font-semibold mt-2">
                        💰 Budget: ₹{ev.estimatedBudget.toLocaleString("en-IN")}
                      </p>
                    )}

                    {/* Fees */}
                    <div className="flex gap-3 mt-1 text-xs">
                      {ev.entryFee > 0 && <span className="text-amber-600 font-semibold">💸 ₹{ev.entryFee} entry</span>}
                      {ev.prizePool > 0 && <span className="text-emerald-600 font-semibold">🏆 ₹{ev.prizePool.toLocaleString("en-IN")} prize</span>}
                    </div>

                    {ev.facultyComment && tab !== "PENDING_FACULTY" && (
                      <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-2 text-xs text-slate-600">
                        💬 Your comment: {ev.facultyComment}
                      </div>
                    )}

                    {/* Central event notice */}
                    {central && tab === "FACULTY_APPROVED" && (
                      <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl p-2 text-xs text-amber-700">
                        ℹ This is a college-level event. Use "→ SDW Dean" to forward directly
                        (bypasses dept SDW coordinator).
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <div onClick={() => setDrawer(ev)}
                      className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
                      <Eye size={13} /> Details
                    </div>
                    {tab === "PENDING_FACULTY" && (
                      <div onClick={() => setModal(ev)}
                        className="btn text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
                        <CheckCircle size={13} /> Review
                      </div>
                    )}
                    {tab === "FACULTY_APPROVED" && central && (
                      <button onClick={() => forwardToDean(ev)} disabled={forwarding === ev.id}
                        className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                        <ArrowRight size={13} />
                        {forwarding === ev.id ? "…" : "→ SDW Dean"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <WorkflowBadge status={getStatus(ev)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ApprovalModal eventTitle={modal.title} onClose={() => setModal(null)}
          onSubmit={handleAction} loading={actioning} />
      )}
      {drawer && (
        <EventDetailDrawer event={drawer} onClose={() => setDrawer(null)} showBudget={false} />
      )}
    </DashboardLayout>
  );
}