import { X, Calendar, MapPin, Users, IndianRupee, Phone, Globe, Trophy, Gift, Clock } from "lucide-react";
import { STATUS_META } from "../constants";
import WorkflowBadge from "./WorkflowBadge";

function fmt(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleString("en-IN", {
    day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
}
function fmtDate(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}

function Row({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        {href
          ? <a href={href} target="_blank" rel="noreferrer"
              className="text-sm font-medium text-emerald-600 hover:underline">{value}</a>
          : <p className="text-sm font-medium text-slate-800">{value}</p>}
      </div>
    </div>
  );
}

function BudgetBar({ label, value, total }) {
  if (!value || !total) return null;
  const pct = Math.round((value / total) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>₹{value.toLocaleString("en-IN")} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full" style={{width:`${pct}%`}} />
      </div>
    </div>
  );
}

export default function EventDetailDrawer({ event, onClose, showBudget = false }) {
  if (!event) return null;
  const meta        = STATUS_META[event.status] || {label:event.status, color:"badge-gray"};
  const multiDay    = event.endDate && fmtDate(event.startDate) !== fmtDate(event.endDate);
  const budgetTotal = event.estimatedBudget;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col
        animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            <span className={`badge ${meta.color} mb-2`}>{meta.label}</span>
            <h2 className="font-bold text-slate-800 text-lg leading-snug">{event.title}</h2>
            {event.clubName && (
              <p className="text-sm text-slate-500 mt-0.5">🎯 {event.clubName}</p>
            )}
          </div>
          <button onClick={onClose} className="ml-3 text-slate-400 hover:text-slate-600 transition shrink-0">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">

          {/* Workflow */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Approval Status</p>
            <WorkflowBadge status={event.status} />
          </section>

          {/* Comments from reviewers */}
          {(event.facultyComment || event.sdwComment || event.hodComment) && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reviewer Comments</p>
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
                  <p className="text-xs font-semibold text-amber-600 mb-1">HoD</p>
                  <p className="text-sm text-slate-700">{event.hodComment}</p>
                </div>
              )}
            </section>
          )}

          {/* Description */}
          {event.description && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-slate-700 leading-relaxed">{event.description}</p>
            </section>
          )}

          {/* Details */}
          <section className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</p>
            <Row icon={Calendar} label="Date"
              value={multiDay ? `${fmtDate(event.startDate)} → ${fmtDate(event.endDate)}` : fmt(event.startDate || event.eventDate)} />
            <Row icon={Clock}    label="Registration Deadline" value={fmt(event.registrationDeadline)} />
            <Row icon={MapPin}   label="Venue"                 value={event.location} />
            <Row icon={Users}    label="Max Participants"      value={event.maxParticipants ? `${event.maxParticipants} seats` : null} />
            <Row icon={Phone}    label="Event Coordinator"
              value={event.coordinatorName ? `${event.coordinatorName}${event.coordinatorContact ? " · " + event.coordinatorContact : ""}` : null} />
            {event.clubWebsite && (
              <Row icon={Globe} label="Club Website" value={event.clubWebsite} href={event.clubWebsite} />
            )}
          </section>

          {/* Fees / Prizes */}
          {(event.entryFee || event.prizePool || event.goodies) && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Participation</p>
              {event.entryFee > 0
                ? <Row icon={IndianRupee} label="Entry Fee"   value={`₹${event.entryFee}`} />
                : <div className="flex gap-2 text-sm text-emerald-600 font-medium"><IndianRupee size={15}/> Free Event</div>}
              <Row icon={Trophy} label="Prize Pool" value={event.prizePool ? `₹${event.prizePool.toLocaleString("en-IN")}` : null} />
              <Row icon={Gift}   label="Goodies"    value={event.goodies} />
            </section>
          )}

          {/* Budget — only shown to faculty/sdw/hod/organizer */}
          {showBudget && event.estimatedBudget && (
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Budget Breakdown</p>
              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-600">Total Estimated</span>
                  <span className="text-lg font-bold text-slate-800">
                    ₹{event.estimatedBudget.toLocaleString("en-IN")}
                  </span>
                </div>
                <BudgetBar label="Venue"     value={event.venueExpense}    total={budgetTotal} />
                <BudgetBar label="Food"      value={event.foodExpense}     total={budgetTotal} />
                <BudgetBar label="Decor"     value={event.decorExpense}    total={budgetTotal} />
                <BudgetBar label="Printing"  value={event.printingExpense} total={budgetTotal} />
                <BudgetBar label="Other"     value={event.otherExpense}    total={budgetTotal} />
                {event.budgetNotes && (
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">{event.budgetNotes}</p>
                )}
              </div>
            </section>
          )}

          {/* Post-event report */}
          {(event.eventReport || event.actualExpenditure) && (
            <section className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Post-Event</p>
              {event.actualExpenditure && (
                <div className="flex justify-between items-center glass-card p-3">
                  <span className="text-sm text-slate-600">Actual Expenditure</span>
                  <span className="font-bold text-slate-800">₹{event.actualExpenditure.toLocaleString("en-IN")}</span>
                </div>
              )}
              {event.eventReport && (
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Event Report</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{event.eventReport}</p>
                </div>
              )}
              {event.reimbursementDetails && (
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Reimbursement Details</p>
                  <p className="text-sm text-slate-700">{event.reimbursementDetails}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}