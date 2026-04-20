import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import { safeArray, getStatus, formatDateTime } from "../../utils";
import { Users, Download, CheckSquare, Clock, AlertCircle } from "lucide-react";

function isOngoing(ev) {
  if (!ev?.startDate) return false;
  const now   = new Date();
  const start = new Date(ev.startDate);
  const end   = ev.endDate ? new Date(ev.endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return now >= start && now <= end;
}

function isEventPast(ev) {
  const end = ev?.endDate ? new Date(ev.endDate) : ev?.startDate ? new Date(ev.startDate) : null;
  if (!end) return false;
  return new Date() > end;
}

export default function OrganizerParticipants({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events,      setEvents]      = useState([]);
  const [selectedEv,  setSelectedEv]  = useState(null);
  const [regs,        setRegs]        = useState([]);
  const [attendance,  setAttendance]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    api.get(`/events/organizer/${user.id}`)
      .then(r => {
        const all = safeArray(r.data);
        // Show only APPROVED events (live or past)
        setEvents(all.filter(e => getStatus(e) === "APPROVED"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectEvent = async (ev) => {
    setSelectedEv(ev);
    setLoadingRegs(true);
    try {
      const res = await api.get(`/registrations/event/${ev.id}`);
      const list = safeArray(res.data);
      setRegs(list);
      // Pre-fill existing attendance
      const init = {};
      list.forEach(r => {
        if (r.attendance != null) init[r.id] = r.attendance.present;
        else init[r.id] = false;
      });
      setAttendance(init);
    } catch { alert("Failed to load participants."); }
    finally { setLoadingRegs(false); }
  };

  const saveAttendance = async () => {
    if (!isOngoing(selectedEv)) return;
    setSaving(true);
    try {
      await Promise.all(
        regs.map(r =>
          api.post("/attendance/mark", {
            registrationId: r.id,
            present:        !!attendance[r.id],
            markedById:     user.id,
          })
        )
      );
      alert("Attendance saved successfully!");
    } catch { alert("Failed to save attendance."); }
    finally { setSaving(false); }
  };

  const downloadCSV = () => {
    const rows = [["PRN","Name","Email","Attended"]];
    regs.forEach(r => {
      const s = r.student;
      rows.push([s?.prn || "—", s?.name || "—", s?.email || "—",
        attendance[r.id] ? "Yes" : "No"]);
    });
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${selectedEv?.title || "participants"}_attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ongoing = selectedEv ? isOngoing(selectedEv) : false;
  const past    = selectedEv ? isEventPast(selectedEv) : false;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Participants & Attendance"
        subtitle="View registrations · Mark attendance only during the event" />

      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Event list */}
        <div className="md:col-span-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Your Live Events ({events.length})
          </h2>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
          ) : events.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-slate-400">
              No approved events yet.
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(ev => (
                <button key={ev.id} onClick={() => selectEvent(ev)}
                  className={`w-full text-left glass-card px-4 py-3 transition-all
                    ${selectedEv?.id === ev.id
                      ? "ring-2 ring-indigo-400 shadow-md"
                      : "hover:shadow-md"}`}>
                  <p className="font-semibold text-slate-800 text-sm truncate">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(ev.startDate)}</p>
                  <div className="flex gap-1 mt-1.5">
                    {isOngoing(ev) && (
                      <span className="badge badge-green" style={{fontSize:"10px"}}>🟢 Ongoing</span>
                    )}
                    {isEventPast(ev) && !isOngoing(ev) && (
                      <span className="badge badge-gray" style={{fontSize:"10px"}}>Past</span>
                    )}
                    {!isOngoing(ev) && !isEventPast(ev) && (
                      <span className="badge badge-yellow" style={{fontSize:"10px"}}>Upcoming</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Participants panel */}
        <div className="md:col-span-2">
          {!selectedEv ? (
            <div className="glass-card p-12 text-center">
              <Users size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Select an event to view participants</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{selectedEv.title}</h3>
                  <p className="text-xs text-slate-400">{regs.length} registered</p>
                </div>
                <div className="flex gap-2">
                  {(past || ongoing) && regs.length > 0 && (
                    <button onClick={downloadCSV}
                      className="btn-outline text-xs px-3 py-2 flex items-center gap-1">
                      <Download size={13} /> CSV
                    </button>
                  )}
                  {ongoing && regs.length > 0 && (
                    <button onClick={saveAttendance} disabled={saving}
                      className="btn text-xs px-3 py-2 flex items-center gap-1">
                      <CheckSquare size={13} />
                      {saving ? "Saving…" : "Save Attendance"}
                    </button>
                  )}
                </div>
              </div>

              {/* Attendance timing notice */}
              {!ongoing && !past && (
                <div className="glass-card p-4 mb-4 flex items-start gap-3 bg-amber-50/60 border-amber-100">
                  <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Event hasn't started yet</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Attendance marking opens at: <strong>{formatDateTime(selectedEv.startDate)}</strong>
                    </p>
                  </div>
                </div>
              )}

              {past && !ongoing && (
                <div className="glass-card p-4 mb-4 flex items-start gap-3 bg-slate-50 border-slate-100">
                  <AlertCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-500">
                    Event has ended. Attendance is read-only. Download CSV for your records.
                  </p>
                </div>
              )}

              {ongoing && (
                <div className="glass-card p-3 mb-4 flex items-center gap-2 bg-emerald-50/60 border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-700">
                    Event is ONGOING — mark attendance now
                  </p>
                </div>
              )}

              {loadingRegs ? (
                <div className="space-y-2">
                  {[1,2,3].map(i=><div key={i} className="skeleton h-14 rounded-xl"/>)}
                </div>
              ) : regs.length === 0 ? (
                <div className="glass-card p-10 text-center text-slate-400 text-sm">
                  No students registered yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {regs.map((reg, i) => {
                    const s = reg.student;
                    return (
                      <div key={reg.id}
                        style={{ animationDelay:`${i*30}ms` }}
                        className="glass-card px-4 py-3 flex items-center gap-4
                          animate-[fadeSlideUp_0.25s_ease_both]">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center
                          justify-center text-indigo-600 font-bold text-sm shrink-0">
                          {s?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{s?.name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {s?.prn && `PRN: ${s.prn} · `}{s?.email}
                          </p>
                        </div>

                        {/* Attendance toggle — only during event */}
                        {ongoing ? (
                          <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <div
                              onClick={() => setAttendance(a => ({ ...a, [reg.id]: !a[reg.id] }))}
                              className={`relative w-11 h-6 rounded-full transition-colors duration-200
                                ${attendance[reg.id] ? "bg-emerald-500" : "bg-slate-200"}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow
                                transition-transform duration-200
                                ${attendance[reg.id] ? "translate-x-6" : "translate-x-1"}`}/>
                            </div>
                            <span className={`text-xs font-semibold
                              ${attendance[reg.id] ? "text-emerald-600" : "text-slate-400"}`}>
                              {attendance[reg.id] ? "Present" : "Absent"}
                            </span>
                          </label>
                        ) : (
                          <span className={`badge shrink-0
                            ${attendance[reg.id] ? "badge-green" : "badge-gray"}`}>
                            {attendance[reg.id] ? "Present" : "Absent"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}