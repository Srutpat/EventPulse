import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { safeArray, formatDateTime, formatDateOnly, deadlinePassed } from "../utils";
import {
  Zap, Calendar, MapPin, Trophy, IndianRupee,
  Users, Clock, ArrowRight, Search, Globe, Phone
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    api.get("/events/approved")
      .then(r => {
        const all = safeArray(r.data);
        // Only events whose registration deadline has NOT passed
        const live = all.filter(e => !deadlinePassed(e));
        setEvents(live);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    return !q
      || ev.title?.toLowerCase().includes(q)
      || ev.clubName?.toLowerCase().includes(q)
      || ev.department?.toLowerCase().includes(q)
      || ev.location?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f0f2f8 0%,#e8e4f8 100%)" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight"
              style={{ fontFamily: "'Outfit',sans-serif" }}>EventPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")}
              className="btn-outline text-sm px-4 py-2">Sign In</button>
            <button onClick={() => navigate("/signup")}
              className="btn text-sm px-4 py-2">Register</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100
          text-indigo-700 text-xs font-bold mb-6 border border-indigo-200">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>
          {events.length} events live now
        </div>
        <h1 className="text-5xl font-bold text-slate-800 mb-4 leading-tight"
          style={{ fontFamily: "'Outfit',sans-serif" }}>
          Where Campus Events<br/>
          <span style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Come Alive
          </span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
          Discover events from every club and department. Register in one click.
        </p>

        {/* Search */}
        <div className="max-w-lg mx-auto relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            placeholder="Search events, clubs, departments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-11 py-3 text-base shadow-lg"
          />
        </div>
      </div>

      {/* Events grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-500 text-lg">
              {search ? "No events match your search" : "No live events right now"}
            </p>
            <p className="text-slate-400 mt-2 text-sm">Check back soon — events get approved regularly.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 font-medium mb-5">
              Showing {filtered.length} live event{filtered.length !== 1 ? "s" : ""} with open registration
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((ev, i) => {
                const multiDay = ev.endDate &&
                  formatDateOnly(ev.startDate) !== formatDateOnly(ev.endDate);
                const deadlineDate = ev.registrationDeadline
                  ? new Date(ev.registrationDeadline)
                  : null;
                const daysLeft = deadlineDate
                  ? Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div key={ev.id}
                    style={{ animationDelay:`${i*40}ms` }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100
                      flex flex-col hover:-translate-y-1 hover:shadow-xl
                      transition-all duration-200 animate-[fadeSlideUp_0.35s_ease_both] overflow-hidden">

                    {/* Coloured top bar */}
                    <div className="h-1.5 w-full"
                      style={{ background:"linear-gradient(90deg,#6366f1,#8b5cf6)" }} />

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      {/* Title + badges */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {ev.category && (
                            <span className="badge badge-indigo">{ev.category}</span>
                          )}
                          {ev.clubName && (
                            <span className="badge badge-violet">{ev.clubName}</span>
                          )}
                          {daysLeft !== null && daysLeft <= 3 && (
                            <span className="badge badge-red">⚡ {daysLeft}d left</span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-800 text-base leading-snug">
                          {ev.title}
                        </h3>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {/* Details */}
                      <div className="text-xs text-slate-500 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          {multiDay
                            ? `${formatDateOnly(ev.startDate)} → ${formatDateOnly(ev.endDate)}`
                            : formatDateTime(ev.startDate || ev.eventDate)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          {ev.location}
                        </div>
                        {ev.maxParticipants && (
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-slate-400 shrink-0" />
                            Max {ev.maxParticipants} participants
                          </div>
                        )}
                        {ev.registrationDeadline && (
                          <div className={`flex items-center gap-1.5 font-medium
                            ${daysLeft <= 3 ? "text-red-500" : "text-amber-500"}`}>
                            <Clock size={12} className="shrink-0" />
                            Deadline: {formatDateTime(ev.registrationDeadline)}
                          </div>
                        )}
                      </div>

                      {/* Perks row */}
                      <div className="flex gap-3 flex-wrap text-xs">
                        {ev.entryFee > 0
                          ? <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <IndianRupee size={11} /> ₹{ev.entryFee} entry
                            </span>
                          : <span className="font-semibold text-emerald-600">✓ Free Event</span>
                        }
                        {ev.prizePool > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <Trophy size={11} /> ₹{ev.prizePool.toLocaleString("en-IN")} prize
                          </span>
                        )}
                      </div>

                      {/* Coordinator */}
                      {ev.coordinatorName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Phone size={11} />
                          {ev.coordinatorName}
                          {ev.coordinatorContact && ` · ${ev.coordinatorContact}`}
                        </div>
                      )}
                      {ev.clubWebsite && (
                        <a href={ev.clubWebsite} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-500 hover:underline self-start">
                          <Globe size={11} /> Club Website
                        </a>
                      )}

                      {/* Register button */}
                      <div className="mt-auto pt-2">
                        <button onClick={() => navigate("/login")}
                          className="btn w-full text-sm py-2.5">
                          Register Now <ArrowRight size={14} />
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-1.5">
                          Sign in or create an account to register
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white/60 py-6 text-center">
        <p className="text-sm text-slate-400">
          EventPulse © 2025 · College Event Management System
        </p>
      </div>
    </div>
  );
}