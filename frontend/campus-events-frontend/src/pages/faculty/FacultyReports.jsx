import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import { formatDate }  from "../../components/EventCard";
import { Download, ChevronDown, ChevronUp, Users, CheckCircle } from "lucide-react";

export default function FacultyReports({ onLogout }) {
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState({});
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    api.get("/events/approved")
      .then(r => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (eventId) => {
    const next = { ...expanded, [eventId]: !expanded[eventId] };
    setExpanded(next);
    if (next[eventId] && !attendance[eventId]) {
      try {
        const r = await api.get(`/attendance/event/${eventId}`);
        setAttendance(a => ({ ...a, [eventId]: Array.isArray(r.data) ? r.data : [] }));
      } catch {
        setAttendance(a => ({ ...a, [eventId]: [] }));
      }
    }
  };

  const exportCSV = (ev, e) => {
    e.stopPropagation();
    const rows = attendance[ev.id] || [];
    if (!rows.length) { alert("No attendance data to export."); return; }
    const header = "PRN,Name,Department,Division,Present,Marked At";
    const lines  = rows.map(a => [
      a.registration?.student?.prn        || "",
      a.registration?.student?.name       || "",
      a.registration?.student?.department || "",
      a.registration?.student?.division   || "",
      a.present ? "Yes" : "No",
      a.markedAt ? new Date(a.markedAt).toLocaleString("en-IN") : "",
    ].join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ev.title.replace(/\s+/g,"_")}_attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Attendance Reports" subtitle="View and download attendance for approved events"/>

      {loading ? (
        <div className="text-center text-slate-400 mt-16 text-sm">Loading…</div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-400 text-sm">No approved events yet.</div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {events.map(ev => {
            const data    = attendance[ev.id];
            const present = data?.filter(a => a.present).length ?? 0;
            const total   = data?.length ?? 0;
            const pct     = total > 0 ? Math.round((present / total) * 100) : null;

            return (
              <div key={ev.id} className="glass-card overflow-hidden">

                {/* ── Header row — outer div, NOT button, to allow inner button ── */}
                <div
                  onClick={() => toggle(ev.id)}
                  className="w-full flex items-center justify-between p-4
                    hover:bg-slate-50/60 transition cursor-pointer select-none">

                  <div>
                    <p className="font-semibold text-slate-800">{ev.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(ev.startDate || ev.eventDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {data && (
                      <>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Users size={12}/>{total} registered
                        </span>
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle size={12}/>{present} present {pct !== null ? `(${pct}%)` : ""}
                        </span>
                        {/* ✅ standalone button — no longer nested inside another button */}
                        <button
                          onClick={(e) => exportCSV(ev, e)}
                          className="btn text-xs px-2.5 py-1 flex items-center gap-1">
                          <Download size={12}/> CSV
                        </button>
                      </>
                    )}
                    {expanded[ev.id]
                      ? <ChevronUp size={16} className="text-slate-400"/>
                      : <ChevronDown size={16} className="text-slate-400"/>}
                  </div>
                </div>

                {/* ── Expanded attendance table ── */}
                {expanded[ev.id] && (
                  <div className="border-t border-slate-200/60">
                    {!data ? (
                      <p className="p-4 text-sm text-slate-400">Loading attendance…</p>
                    ) : data.length === 0 ? (
                      <p className="p-4 text-sm text-slate-400">No attendance records yet.</p>
                    ) : (
                      <>
                        {/* Progress bar */}
                        <div className="px-4 pt-3 pb-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Attendance rate</span>
                            <span>{present}/{total} present</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}/>
                          </div>
                        </div>

                        <table className="w-full text-sm">
                          <thead className="bg-slate-50/60">
                            <tr>
                              {["PRN","Name","Dept","Division","Status"].map(h => (
                                <th key={h} className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.map(att => (
                              <tr key={att.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                                <td className="px-4 py-2.5 text-slate-500 text-xs">
                                  {att.registration?.student?.prn || "—"}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-slate-800">
                                  {att.registration?.student?.name}
                                </td>
                                <td className="px-4 py-2.5 text-slate-500 text-xs">
                                  {att.registration?.student?.department || "—"}
                                </td>
                                <td className="px-4 py-2.5 text-slate-500 text-xs">
                                  {att.registration?.student?.division || "—"}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={att.present ? "badge badge-green" : "badge badge-red"}>
                                    {att.present ? "Present" : "Absent"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}