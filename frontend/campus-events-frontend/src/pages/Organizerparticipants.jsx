import { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/PageHeader";
import { formatDate } from "../components/EventCard";
import { Users, ChevronDown, ChevronUp } from "lucide-react";

export default function OrganizerParticipants({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events,        setEvents]       = useState([]);
  const [participants,  setParticipants] = useState({});
  const [expanded,      setExpanded]     = useState({});
  const [loading,       setLoading]      = useState(true);

  useEffect(() => {
    api.get(`/events/organizer/${user.id}`)
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleEvent = async (eventId) => {
    const next = { ...expanded, [eventId]: !expanded[eventId] };
    setExpanded(next);

    // Load participants on first expand
    if (next[eventId] && !participants[eventId]) {
      try {
        const res = await api.get(`/registrations/event/${eventId}`);
        setParticipants((p) => ({ ...p, [eventId]: res.data }));
      } catch {
        setParticipants((p) => ({ ...p, [eventId]: [] }));
      }
    }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Participants" subtitle="See who registered for your events" />

      {loading ? (
        <div className="text-center text-slate-400 mt-20 text-sm">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-400 mt-20 text-sm">
          No events found.
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {events.map((event) => (
            <div key={event.id} className="glass-card overflow-hidden">
              {/* Event header row */}
              <button
                onClick={() => toggleEvent(event.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/60 transition">
                <div className="text-left">
                  <p className="font-semibold text-slate-800">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(event.eventDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={13} />
                    {participants[event.id]?.length ?? "—"}
                  </span>
                  {expanded[event.id]
                    ? <ChevronUp size={16} className="text-slate-400" />
                    : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Participants list */}
              {expanded[event.id] && (
                <div className="border-t border-slate-200/60">
                  {!participants[event.id] ? (
                    <p className="p-4 text-sm text-slate-400">Loading…</p>
                  ) : participants[event.id].length === 0 ? (
                    <p className="p-4 text-sm text-slate-400">No registrations yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/60">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">#</th>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Name</th>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">PRN</th>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Department</th>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants[event.id].map((reg, i) => (
                          <tr key={reg.id}
                            className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                            <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-800">
                              {reg.student?.name}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">{reg.student?.prn || "—"}</td>
                            <td className="px-4 py-2.5 text-slate-500">{reg.student?.department || "—"}</td>
                            <td className="px-4 py-2.5 text-slate-500">{formatDate(reg.registeredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}