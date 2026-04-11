import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import PageHeader        from "../../components/PageHeader";
import ApprovalModal     from "../../components/ApprovalModal";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import WorkflowBadge     from "../../components/WorkflowBadge";
import { formatDate }    from "../../components/EventCard";
import { Eye, CheckCircle, ArrowRight } from "lucide-react";

const TABS = [
  {key:"PENDING_SDW",   label:"Pending"},
  {key:"SDW_APPROVED",  label:"Approved"},
  {key:"SDW_REJECTED",  label:"Rejected"},
  {key:"PENDING_HOD",   label:"Forwarded to HoD"},
];

export default function SDWApprovals({ onLogout }) {
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("PENDING_SDW");
  const [modal,     setModal]     = useState(null);
  const [drawer,    setDrawer]    = useState(null);
  const [actioning, setActioning] = useState(false);
  const [forwarding,setForwarding]= useState(null);

  const load = () => api.get("/events").then(r=>setEvents(r.data)).catch(console.error).finally(()=>setLoading(false));
  useEffect(load,[]);

  const filtered = events.filter(e => e.status === tab);
  const count    = s => events.filter(e=>e.status===s).length;

  const handleAction = async ({ action, comment }) => {
    setActioning(true);
    try {
      await api.post(`/events/${modal.id}/sdw-review`, { action, comment });
      setEvents(prev => prev.map(e => e.id===modal.id
        ? {...e, status: action==="APPROVE"?"SDW_APPROVED":"SDW_REJECTED", sdwComment:comment} : e));
      setModal(null);
    } catch (err) { alert(err.response?.data||"Action failed."); }
    finally { setActioning(false); }
  };

  const forwardToHod = async (ev) => {
    setForwarding(ev.id);
    try {
      await api.post(`/events/${ev.id}/forward-hod`);
      setEvents(prev => prev.map(e => e.id===ev.id ? {...e, status:"PENDING_HOD"} : e));
    } catch (err) { alert(err.response?.data||"Failed."); }
    finally { setForwarding(null); }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Event & Budget Review" subtitle="Review events with budgets — then forward to HoD"/>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({key,label}) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
              ${tab===key ? "bg-amber-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {label}
            {count(key)>0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab===key?"bg-white/20 text-white":"bg-slate-100 text-slate-600"}`}>
                {count(key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-slate-400 mt-16 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-400 text-sm">No events here.</div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {filtered.map(ev => (
            <div key={ev.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {formatDate(ev.startDate||ev.eventDate)}
                  </p>
                  {/* Budget summary */}
                  {ev.estimatedBudget && (
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className="font-semibold text-emerald-700">
                        Budget: ₹{ev.estimatedBudget.toLocaleString("en-IN")}
                      </span>
                      {ev.budgetNotes && (
                        <span className="text-slate-400 truncate max-w-xs">{ev.budgetNotes}</span>
                      )}
                    </div>
                  )}
                  {ev.sdwComment && tab!=="PENDING_SDW" && (
                    <div className="mt-2 bg-slate-50 rounded-lg p-2 text-xs text-slate-500">💬 {ev.sdwComment}</div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 flex-col items-end">
                  <div className="flex gap-2">
                    <button onClick={() => setDrawer(ev)}
                      className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
                      <Eye size={13}/> View
                    </button>
                    {tab === "PENDING_SDW" && (
                      <button onClick={() => setModal(ev)}
                        className="btn text-xs px-3 py-1.5 flex items-center gap-1">
                        <CheckCircle size={13}/> Review
                      </button>
                    )}
                  </div>
                  {tab === "SDW_APPROVED" && (
                    <button onClick={() => forwardToHod(ev)}
                      disabled={forwarding===ev.id}
                      className="btn text-xs px-3 py-1.5 flex items-center gap-1 !bg-amber-600 hover:!bg-amber-700">
                      <ArrowRight size={13}/>
                      {forwarding===ev.id ? "Forwarding…" : "Forward to HoD"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4"><WorkflowBadge status={ev.status}/></div>
            </div>
          ))}
        </div>
      )}

      {modal  && <ApprovalModal eventTitle={modal.title} onClose={()=>setModal(null)} onSubmit={handleAction} loading={actioning}/>}
      {drawer && <EventDetailDrawer event={drawer} onClose={()=>setDrawer(null)} showBudget={true}/>}
    </DashboardLayout>
  );
}