import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import PageHeader        from "../../components/PageHeader";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import { deadlinePassed, safeArray, formatDateOnly, formatDateTime } from "../../utils";
import {
  Search, Filter, Calendar, MapPin, Trophy,
  IndianRupee, Globe, CheckCircle, AlertCircle, Users, Clock
} from "lucide-react";

export default function StudentEvents({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events,        setEvents]        = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [counts,        setCounts]        = useState({});
  const [loading,       setLoading]       = useState(true);
  const [registering,   setRegistering]   = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [search,        setSearch]        = useState("");
  const [catFilter,     setCatFilter]     = useState("ALL");
  const [showFreeOnly,  setShowFreeOnly]  = useState(false);

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
        setRegisteredIds(regs.map(r => r.event?.id).filter(Boolean));

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

  const CATS = useMemo(() =>
    ["ALL", ...new Set(events.map(e => e.category).filter(Boolean))],
    [events]
  );

  const filtered = useMemo(() => events.filter(ev => {
    const q = search.toLowerCase();
    const matchQ  = !q || ev.title.toLowerCase().includes(q)
                      || ev.department?.toLowerCase().includes(q)
                      || ev.clubName?.toLowerCase().includes(q)
                      || ev.location?.toLowerCase().includes(q);
    const matchCat  = catFilter === "ALL" || ev.category === catFilter;
    const matchFree = !showFreeOnly || !ev.entryFee || ev.entryFee === 0;
    return matchQ && matchCat && matchFree;
  }), [events, search, catFilter, showFreeOnly]);

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Browse Events"
        subtitle={`${events.length} events available — find something exciting`}/>

      {/* Search + Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400"/>
            <input placeholder="Search by name, club, department, location…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-10"/>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600
            cursor-pointer px-4 py-2 rounded-xl border border-slate-200 bg-white
            hover:border-indigo-300 transition select-none">
            <input type="checkbox" checked={showFreeOnly}
              onChange={e => setShowFreeOnly(e.target.checked)}
              className="rounded"/>
            Free only
          </label>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mt-3">
          {CATS.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150
                ${catFilter === cat
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-52 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Search size={36} className="text-slate-200 mx-auto mb-3"/>
          <p className="font-semibold text-slate-500">No events match your filters</p>
          <button onClick={() => { setSearch(""); setCatFilter("ALL"); setShowFreeOnly(false); }}
            className="btn mt-4 text-xs px-4">Clear Filters</button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3 font-medium">
            Showing {filtered.length} of {events.length} events
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((ev, i) => {
              const isReg    = registeredIds.includes(ev.id);
              const dlPassed = deadlinePassed(ev);
              const count    = counts[ev.id] || 0;
              const isFull   = ev.maxParticipants && count >= ev.maxParticipants;
              const multiDay = ev.endDate && formatDateOnly(ev.startDate) !== formatDateOnly(ev.endDate);

              return (
                <div key={ev.id}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className="event-card animate-[fadeSlideUp_0.3s_ease_both]">

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 leading-snug">{ev.title}</h3>
                    {ev.category && <span className="badge badge-indigo shrink-0">{ev.category}</span>}
                  </div>

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

                  {ev.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar size={11} className="text-slate-400"/>
                      {multiDay
                        ? `${formatDateOnly(ev.startDate)} → ${formatDateOnly(ev.endDate)}`
                        : formatDateTime(ev.startDate || ev.eventDate)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-slate-400"/> {ev.location}
                    </p>
                    {ev.maxParticipants && (
                      <p className={`flex items-center gap-1.5 ${isFull ? "text-red-500 font-semibold" : ""}`}>
                        <Users size={11} className="text-slate-400"/>
                        {count}/{ev.maxParticipants} seats {isFull && "· FULL"}
                      </p>
                    )}
                    {ev.registrationDeadline && (
                      <p className={`flex items-center gap-1.5 ${dlPassed ? "text-red-500 font-semibold" : "text-amber-500"}`}>
                        <Clock size={11}/>
                        Deadline: {formatDateTime(ev.registrationDeadline)}
                        {dlPassed && " · CLOSED"}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {ev.entryFee > 0
                      ? <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                          <IndianRupee size={10}/> ₹{ev.entryFee}
                        </span>
                      : <span className="text-xs font-semibold text-emerald-600">✓ Free</span>}
                    {ev.prizePool > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Trophy size={10}/> ₹{ev.prizePool.toLocaleString("en-IN")}
                      </span>
                    )}
                    {ev.goodies && (
                      <span className="text-xs text-slate-500">🎁 {ev.goodies}</span>
                    )}
                  </div>

                  {ev.coordinatorName && (
                    <p className="text-xs text-slate-400">
                      👤 {ev.coordinatorName}{ev.coordinatorContact ? ` · ${ev.coordinatorContact}` : ""}
                    </p>
                  )}

                  <button onClick={() => setSelected(ev)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium self-start transition">
                    View full details →
                  </button>

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
        </>
      )}

      {selected && (
        <EventDetailDrawer event={selected} onClose={() => setSelected(null)} showBudget={false}/>
      )}
    </DashboardLayout>
  );
}