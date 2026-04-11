import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import PageHeader        from "../../components/PageHeader";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import { Calendar, MapPin, CheckCircle, XCircle, Clock, Globe, ChevronRight } from "lucide-react";

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day:"numeric", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });
}
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day:"numeric", month:"short", year:"numeric"
  });
}

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

export default function StudentRegistrations({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [registrations, setRegistrations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);

  useEffect(() => {
    api.get(`/registrations/student/${user.id}`)
      .then(r => setRegistrations(safeArray(r.data)))
      .catch(err => { console.error(err); setRegistrations([]); })
      .finally(() => setLoading(false));
  }, []);

  const now      = new Date();
  const upcoming = registrations.filter(r =>
    r.event?.startDate && new Date(r.event.startDate) > now
  );
  const past = registrations.filter(r =>
    !r.event?.startDate || new Date(r.event.startDate) <= now
  );

  const AttBadge = ({ att }) => {
    if (att == null) return (
      <span className="badge badge-gray flex items-center gap-1 text-xs">
        <Clock size={10}/> Attendance Pending
      </span>
    );
    return att.present
      ? <span className="badge badge-green flex items-center gap-1 text-xs"><CheckCircle size={10}/>Present</span>
      : <span className="badge badge-red flex items-center gap-1 text-xs"><XCircle size={10}/>Absent</span>;
  };

  const RegCard = ({ reg }) => {
    const ev       = reg.event;
    if (!ev) return null;
    const multiDay = ev.endDate && fmtDate(ev.startDate) !== fmtDate(ev.endDate);
    const isPast   = ev.startDate && new Date(ev.startDate) <= now;

    return (
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3
        hover:shadow-md transition-all duration-200">

        <div className="flex-1 min-w-0">
          {/* Title + club */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-slate-800">{ev.title}</p>
            {ev.clubName && <span className="badge badge-violet">{ev.clubName}</span>}
            {ev.category && <span className="badge badge-blue">{ev.category}</span>}
          </div>

          {/* Date, location */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar size={11}/>
              {multiDay
                ? `${fmtDate(ev.startDate)} → ${fmtDate(ev.endDate)}`
                : fmt(ev.startDate || ev.eventDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11}/>{ev.location}
            </span>
            {ev.clubWebsite && (
              <a href={ev.clubWebsite} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-emerald-600 hover:underline">
                <Globe size={11}/>Club website
              </a>
            )}
          </div>

          {/* Coordinator */}
          {ev.coordinatorName && (
            <p className="text-xs text-slate-400 mt-1">
              👤 {ev.coordinatorName}
              {ev.coordinatorContact && ` · ${ev.coordinatorContact}`}
            </p>
          )}

          {/* Entry fee / prize */}
          <div className="flex gap-3 mt-1 text-xs flex-wrap">
            {ev.entryFee > 0
              ? <span className="text-amber-600 font-medium">💸 Entry Fee: ₹{ev.entryFee}</span>
              : <span className="text-emerald-600 font-medium">✅ Free Event</span>}
            {ev.prizePool > 0 && (
              <span className="text-emerald-600 font-medium">
                🏆 Prize: ₹{ev.prizePool.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1.5">
            Registered on: {fmt(reg.registeredAt)}
          </p>
        </div>

        {/* Right side: attendance + view */}
        <div className="flex items-center gap-3 shrink-0 self-start">
          {isPast && <AttBadge att={reg.attendance}/>}
          {/* ✅ div instead of button to avoid any nesting issues */}
          <div onClick={() => setSelected(ev)}
            className="text-slate-300 hover:text-emerald-500 transition cursor-pointer p-1">
            <ChevronRight size={18}/>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, items, emptyMsg }) => (
    <div className="mb-8">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        {title}
        <span className="ml-2 text-slate-300 font-normal normal-case">({items.length})</span>
      </h2>
      {items.length === 0
        ? <p className="text-sm text-slate-400 pl-1">{emptyMsg}</p>
        : <div className="space-y-3">{items.map(r => <RegCard key={r.id} reg={r}/>)}</div>}
    </div>
  );

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader
        title="My Registrations"
        subtitle="All your event registrations — upcoming and past"
      />

      {loading ? (
        <div className="text-center text-slate-400 mt-20 text-sm">Loading your registrations…</div>
      ) : registrations.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-slate-500 font-medium mb-1">No registrations yet</p>
          <p className="text-sm text-slate-400">Browse events and register for ones you're interested in!</p>
        </div>
      ) : (
        <>
          <Section
            title="Upcoming Events"
            items={upcoming}
            emptyMsg="No upcoming events. Browse and register!"
          />
          <Section
            title="Past Events"
            items={past}
            emptyMsg="No past events yet."
          />
        </>
      )}

      {selected && (
        <EventDetailDrawer
          event={selected}
          onClose={() => setSelected(null)}
          showBudget={false}
        />
      )}
    </DashboardLayout>
  );
}