import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import PageHeader        from "../../components/PageHeader";
import ApprovalModal     from "../../components/ApprovalModal";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import WorkflowBadge     from "../../components/WorkFlowBadge";
import { safeArray, getStatus, formatDateTime, filterForHoD } from "../../utils";
import { Eye, ShieldCheck, Calendar, IndianRupee } from "lucide-react";

const TABS = [
  { key:"PENDING_HOD",  label:"Pending Final Approval" },
  { key:"APPROVED",     label:"Approved (Live)"        },
  { key:"HOD_REJECTED", label:"Rejected"               },
];

export default function HoDApprovals({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("PENDING_HOD");
  const [modal,     setModal]     = useState(null);
  const [drawer,    setDrawer]    = useState(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/events")
      .then(r => {
        const all     = safeArray(r.data);
        const visible = filterForHoD(all, user.department);
        setEvents(visible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => getStatus(e) === tab);
  const count    = s => events.filter(e => getStatus(e) === s).length;

  const handleAction = async ({ action, comment }) => {
    setActioning(true);
    try {
      const res = await api.post(`/events/${modal.id}/hod-review`, { action, comment });
      // Always use server response — never hardcode status
      setEvents(prev => prev.map(e => e.id === modal.id ? res.data : e));
      setModal(null);
    } catch (err) {
      alert(err.response?.data || "Action failed.");
    } finally { setActioning(false); }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Final Approvals"
        subtitle="HoD approval makes events live to students"/>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg"
                : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}>
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
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-3xl">
          <ShieldCheck size={36} className="text-slate-200 mx-auto mb-3"/>
          <p className="text-slate-400 text-sm">
            {tab === "PENDING_HOD" ? "No events awaiting your approval." : "No events here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filtered.map((ev, i) => (
            <div key={ev.id}
              style={{ animationDelay:`${i*50}ms` }}
              className="glass-card p-5 animate-[fadeSlideUp_0.3s_ease_both]">

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-800">{ev.title}</h3>
                    {ev.clubName   && <span className="badge badge-violet">{ev.clubName}</span>}
                    {ev.department && <span className="badge badge-blue">{ev.department}</span>}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={11}/> {formatDateTime(ev.startDate || ev.eventDate)}
                    </span>
                    {ev.estimatedBudget && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <IndianRupee size={11}/>₹{ev.estimatedBudget.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    By <span className="font-semibold text-slate-600">{ev.organizer?.name}</span>
                  </p>

                  {/* Reviewer chain */}
                  {(ev.facultyComment || ev.sdwComment) && (
                    <div className="mt-2 space-y-1">
                      {ev.facultyComment && (
                        <p className="text-xs bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                          <span className="font-semibold text-blue-600">Faculty:</span> {ev.facultyComment}
                        </p>
                      )}
                      {ev.sdwComment && (
                        <p className="text-xs bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5">
                          <span className="font-semibold text-violet-600">SDW:</span> {ev.sdwComment}
                        </p>
                      )}
                    </div>
                  )}

                  {ev.hodComment && tab !== "PENDING_HOD" && (
                    <div className="mt-2 bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-xs text-slate-600">
                      💬 Your decision: {ev.hodComment}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <div onClick={() => setDrawer(ev)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
                    <Eye size={13}/> Full View
                  </div>
                  {tab === "PENDING_HOD" && (
                    <div onClick={() => setModal(ev)}
                      className="btn text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
                      <ShieldCheck size={13}/> Decide
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <WorkflowBadge status={getStatus(ev)}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ApprovalModal eventTitle={modal.title} onClose={() => setModal(null)}
          onSubmit={handleAction} loading={actioning}/>
      )}
      {drawer && (
        <EventDetailDrawer event={drawer} onClose={() => setDrawer(null)} showBudget={true}/>
      )}
    </DashboardLayout>
  );
}