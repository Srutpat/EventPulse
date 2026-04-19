import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import StatCard          from "../../components/StatCard";
import PageHeader        from "../../components/PageHeader";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import { deadlinePassed, safeArray, formatDateOnly, formatDateTime } from "../../utils";
import {
  Calendar, CheckCircle, Clock, ChevronRight,
  MapPin, Trophy, IndianRupee, Globe, AlertCircle, Users
} from "lucide-react";

export default function StudentDashboard({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events,        setEvents]        = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [regData,       setRegData]       = useState([]);
  const [counts,        setCounts]        = useState({});
  const [loading,       setLoading]       = useState(true);
  const [registering,   setRegistering]   = useState(null);
  const [selected,      setSelected]      = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [evRes, regRes] = await Promise.all([
          api.get("/events/approved"),
          api.get(`/registrations/student/${user.id}`),
        ]);
        const evs  = safeArray(evRes.data);
        const regs = safeArray(regRes.data);
        setEvents(evs);
        setRegData(regs);
        setRegisteredIds(regs.map(r => r.event?.id).filter(Boolean));

        // Fetch seat counts (non-blocking)
        const cm = {};
        await Promise.allSettled(evs.map(async ev => {
          try {
            const r = await api.get(`/registrations/event/${ev.id}/count`);
            cm[ev.id] = r.data?.count ?? 0;
          } catch { cm[ev.id] = 0; }
        }));
        setCounts(cm);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const register = async (eventId) => {
    if (registeredIds.includes(eventId)) return;
    setRegistering(eventId);
    try {
      await api.post("/registrations/register", null, {
        params: { studentId: user.id, eventId }
      });
      setRegisteredIds(p => [...p, eventId]);
      setCounts(c => ({ ...c, [eventId]: (c[eventId] || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed.");
    } finally { setRegistering(null); }
  };

  const now      = new Date();
  const upcoming = regData.filter(r => r.event?.startDate && new Date(r.event.startDate) > now);

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title={`Hello, ${user.name} 👋`}
        subtitle="Discover campus events and track your registrations"/>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Events Available"  value={events.length}        icon={Calendar}    color="indigo"/>
        <StatCard label="Registered"        value={registeredIds.length} icon={CheckCircle} color="emerald"/>
        <StatCard label="Upcoming"          value={upcoming.length}      icon={Clock}       color="amber"/>
      </div>

      {/* Upcoming events section */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            🎯 Your Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.slice(0, 4).map((reg, i) => {
              const ev = reg.event;
              const daysLeft = Math.ceil((new Date(ev.startDate) - now) / (1000 * 60 * 60 * 24));
              return (
                <div key={reg.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer
                    hover:-translate-y-0.5 hover:shadow-md transition-all
                    animate-[fadeSlideUp_0.3s_ease_both]"
                  onClick={() => setSelected(ev)}>
                  <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0
                    text-white font-bold"
                    style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>
                    <span className="text-lg leading-none">{daysLeft}</span>
                    <span className="text-[9px] opacity-80">days</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={10}/> {formatDateTime(ev.startDate)}
                    </p>
                    {ev.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={10}/> {ev.location}
                      </p>
                    )}
                  </div>
                  <span className="badge badge-green shrink-0">Registered</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All available events */}
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        All Available Events
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-52 w-full rounded-2xl"/>)}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={40} className="text-slate-200 mx-auto mb-3"/>
          <p className="font-semibold text-slate-500">No events available right now</p>
          <p className="text-sm text-slate-400 mt-1">Check back soon — new events are approved regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((ev, i) => {
            const isReg    = registeredIds.includes(ev.id);
            const dlPassed = deadlinePassed(ev);
            const count    = counts[ev.id] || 0;
            const isFull   = ev.maxParticipants && count >= ev.maxParticipants;
            const multiDay = ev.endDate && formatDateOnly(ev.startDate) !== formatDateOnly(ev.endDate);

            return (
              <div key={ev.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="event-card animate-[fadeSlideUp_0.35s_ease_both]">

                {/* Header with category */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-800 leading-snug">{ev.title}</h3>
                  {ev.category && (
                    <span className="badge badge-indigo shrink-0">{ev.category}</span>
                  )}
                </div>

                {/* Club + website */}
                {ev.clubName && (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-violet">{ev.clubName}</span>
                    {ev.clubWebsite && (
                      <a href={ev.clubWebsite} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">
                        <Globe size={11}/> Website
                      </a>
                    )}
                  </div>
                )}

                {/* Meta info */}
                <div className="text-xs text-slate-500 space-y-1.5">
                  <p className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400"/>
                    {multiDay
                      ? `${formatDateOnly(ev.startDate)} → ${formatDateOnly(ev.endDate)}`
                      : formatDateTime(ev.startDate || ev.eventDate)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400"/> {ev.location}
                  </p>
                  {ev.maxParticipants && (
                    <p className={`flex items-center gap-1.5 ${isFull ? "text-red-500 font-semibold" : ""}`}>
                      <Users size={12} className="text-slate-400"/>
                      {count}/{ev.maxParticipants} seats {isFull && "· Full"}
                    </p>
                  )}
                </div>

                {/* Perks row */}
                <div className="flex gap-2 flex-wrap">
                  {ev.entryFee > 0
                    ? <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                        <IndianRupee size={10}/> ₹{ev.entryFee} entry
                      </span>
                    : <span className="text-xs font-semibold text-emerald-600">✓ Free Event</span>}
                  {ev.prizePool > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Trophy size={10}/> ₹{ev.prizePool.toLocaleString("en-IN")} prize
                    </span>
                  )}
                </div>

                {/* Deadline warning */}
                {ev.registrationDeadline && !dlPassed && !isReg && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <Clock size={11}/>
                    Deadline: {formatDateTime(ev.registrationDeadline)}
                  </p>
                )}

                {/* View details link */}
                <button onClick={() => setSelected(ev)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium
                    flex items-center gap-1 transition-colors self-start">
                  View full details <ChevronRight size={12}/>
                </button>

                {/* Action button */}
                <div className="mt-auto">
                  {isReg ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200
                      text-emerald-700 text-sm font-semibold text-center flex items-center justify-center gap-2">
                      <CheckCircle size={15}/> Registered
                    </div>
                  ) : dlPassed ? (
                    <div className="w-full py-2 rounded-xl bg-red-50 border border-red-200
                      text-red-600 text-sm font-semibold text-center flex items-center justify-center gap-2">
                      <AlertCircle size={15}/> Registration Closed
                    </div>
                  ) : isFull ? (
                    <div className="w-full py-2 rounded-xl bg-slate-100 border border-slate-200
                      text-slate-500 text-sm font-semibold text-center">
                      Event Full
                    </div>
                  ) : (
                    <button onClick={() => register(ev.id)} disabled={registering === ev.id}
                      className="btn w-full">
                      {registering === ev.id
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Registering…</>
                        : "Register Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <EventDetailDrawer event={selected} onClose={() => setSelected(null)} showBudget={false}/>
      )}
    </DashboardLayout>
  );
}