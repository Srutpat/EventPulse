import { X, Calendar, MapPin, Users, IndianRupee, Phone, Globe, Trophy, Gift, Clock, FileText } from "lucide-react";
import { STATUS_META } from "../constants";
import { getStatus } from "../utils";
import WorkflowBadge from "./WorkFlowBadge";

function fmt(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleString("en-IN", {
    day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
}
function fmtDate(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString("en-IN", {
    day:"numeric", month:"short", year:"numeric"
  });
}

function parseCoordinators(event) {
  // Try coordinatorsJson first (multiple coordinators)
  if (event.coordinatorsJson) {
    try {
      const parsed = JSON.parse(event.coordinatorsJson);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
  }
  // Fallback to single coordinator fields
  if (event.coordinatorName) {
    return [{ name: event.coordinatorName, contact: event.coordinatorContact || "" }];
  }
  return [];
}

function Row({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon size={15} className="text-slate-400 shrink-0 mt-0.5"/>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        {href
          ? <a href={href} target="_blank" rel="noreferrer"
              className="text-sm font-medium text-emerald-600 hover:underline break-all">
              {value}
            </a>
          : <p className="text-sm font-medium text-slate-800">{value}</p>}
      </div>
    </div>
  );
}

function BudgetBar({ label, value, total }) {
  if (!value || !total) return null;
  const pct = Math.round((value / total) * 100);
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>₹{value.toLocaleString("en-IN")} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width:`${pct}%` }}/>
      </div>
    </div>
  );
}

export default function EventDetailDrawer({ event, onClose, showBudget = false }) {
  if (!event) return null;

  const evStatus     = getStatus(event);
  const meta         = STATUS_META[evStatus] || { label: evStatus, color:"badge-gray" };
  const multiDay     = event.endDate && fmtDate(event.startDate) !== fmtDate(event.endDate);
  const budgetTotal  = event.estimatedBudget;
  const coordinators = parseCoordinators(event);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose}/>

      {/* Drawer panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col"
        style={{ animation:"slideInRight 0.25s ease-out" }}>

        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            <span className={`badge ${meta.color} mb-2`}>{meta.label}</span>
            <h2 className="font-bold text-slate-800 text-lg leading-snug">{event.title}</h2>
            {event.clubName && (
              <p className="text-sm text-slate-500 mt-0.5">🎯 {event.clubName}</p>
            )}
          </div>
          <button onClick={onClose} className="ml-3 text-slate-400 hover:text-slate-600 transition shrink-0 p-1">
            <X size={22}/>
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">

          {/* Workflow pipeline */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Approval Progress
            </p>
            <WorkflowBadge status={getStatus(event)}/>
          </section>

          {/* Reviewer comments — STAFF ONLY (not shown to students) */}
          {showBudget && (event.facultyComment || event.sdwComment || event.hodComment) && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reviewer Comments
              </p>
              {event.facultyComment && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Faculty Advisor</p>
                  <p className="text-sm text-slate-700">{event.facultyComment}</p>
                </div>
              )}
              {event.sdwComment && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-violet-600 mb-1">SDW Coordinator</p>
                  <p className="text-sm text-slate-700">{event.sdwComment}</p>
                </div>
              )}
              {event.hodComment && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-600 mb-1">Head of Department</p>
                  <p className="text-sm text-slate-700">{event.hodComment}</p>
                </div>
              )}
            </section>
          )}

          {/* About */}
          {event.description && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-slate-700 leading-relaxed">{event.description}</p>
            </section>
          )}

          {/* Event details */}
          <section className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</p>
            <Row icon={Calendar} label="Date"
              value={multiDay
                ? `${fmtDate(event.startDate)} → ${fmtDate(event.endDate)}`
                : fmt(event.startDate || event.eventDate)}
            />
            <Row icon={Clock}    label="Registration Deadline" value={fmt(event.registrationDeadline)}/>
            <Row icon={MapPin}   label="Venue"                 value={event.location}/>
            {event.department && (
              <Row icon={Users}  label="Department"            value={event.department}/>
            )}
            <Row icon={Users}    label="Max Participants"
              value={event.maxParticipants ? `${event.maxParticipants} seats` : null}/>
            {event.clubWebsite && (
              <Row icon={Globe}  label="Club Website" value={event.clubWebsite} href={event.clubWebsite}/>
            )}
          </section>

          {/* Coordinators — supports multiple */}
          {coordinators.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Event Coordinator{coordinators.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {coordinators.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-emerald-600"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      {c.contact && (
                        <p className="text-xs text-slate-500">{c.contact}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fees / Prizes */}
          {(event.entryFee !== null && event.entryFee !== undefined)
           || event.prizePool || event.goodies
           ? (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Participation
              </p>
              {event.entryFee > 0
                ? <Row icon={IndianRupee} label="Entry Fee" value={`₹${event.entryFee}`}/>
                : (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <IndianRupee size={14}/> Free Event
                  </div>
                )}
              <Row icon={Trophy} label="Prize Pool"
                value={event.prizePool ? `₹${event.prizePool.toLocaleString("en-IN")}` : null}/>
              <Row icon={Gift}   label="Goodies / Perks" value={event.goodies}/>
            </section>
          ) : null}

          {/* Budget — only for faculty/sdw/hod/organizer */}
          {showBudget && event.estimatedBudget && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Budget Breakdown
              </p>
              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Total Estimated Budget</span>
                  <span className="text-xl font-bold text-slate-800">
                    ₹{event.estimatedBudget.toLocaleString("en-IN")}
                  </span>
                </div>
                <BudgetBar label="Venue / Hall"         value={event.venueExpense}    total={budgetTotal}/>
                <BudgetBar label="Food & Refreshments"  value={event.foodExpense}     total={budgetTotal}/>
                <BudgetBar label="Decorations"          value={event.decorExpense}    total={budgetTotal}/>
                <BudgetBar label="Printing / Banners"   value={event.printingExpense} total={budgetTotal}/>
                <BudgetBar label="Other Expenses"       value={event.otherExpense}    total={budgetTotal}/>
                {event.budgetNotes && (
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                    📝 {event.budgetNotes}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Post-event report */}
          {(event.eventReport || event.actualExpenditure) && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Post-Event
              </p>
              {event.actualExpenditure && (
                <div className="flex justify-between items-center glass-card p-3">
                  <span className="text-sm text-slate-600">Actual Expenditure</span>
                  <span className="font-bold text-slate-800">
                    ₹{event.actualExpenditure.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {event.estimatedBudget && event.actualExpenditure && (
                <div className="flex justify-between items-center glass-card p-3">
                  <span className="text-sm text-slate-600">Budget Variance</span>
                  <span className={`font-bold ${
                    event.actualExpenditure > event.estimatedBudget
                      ? "text-red-500" : "text-emerald-600"
                  }`}>
                    {event.actualExpenditure > event.estimatedBudget ? "+" : ""}
                    ₹{Math.abs(event.actualExpenditure - event.estimatedBudget).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {event.eventReport && (
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                    <FileText size={12}/> Event Report
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {event.eventReport}
                  </p>
                </div>
              )}
              {event.reimbursementDetails && (
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Reimbursement Details</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {event.reimbursementDetails}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}