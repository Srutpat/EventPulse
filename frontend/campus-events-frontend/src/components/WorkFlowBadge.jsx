import { WORKFLOW_STEPS, STATUS_META } from "../constants";
import { Check, X, Clock } from "lucide-react";

const STEP_KEYS = WORKFLOW_STEPS.map(s => s.key);

function stepState(stepKey, currentStatus) {
  const rejected = ["FACULTY_REJECTED","SDW_REJECTED","HOD_REJECTED"];
  const rejectedAt = {
    FACULTY_REJECTED: "PENDING_FACULTY",
    SDW_REJECTED:     "PENDING_SDW",
    HOD_REJECTED:     "PENDING_HOD",
  };

  if (currentStatus === "APPROVED") return "done";

  const currentIdx = STEP_KEYS.indexOf(currentStatus);
  const stepIdx    = STEP_KEYS.indexOf(stepKey);

  if (rejected.includes(currentStatus)) {
    const blockedAt = STEP_KEYS.indexOf(rejectedAt[currentStatus]);
    if (stepIdx < blockedAt) return "done";
    if (stepIdx === blockedAt) return "rejected";
    return "pending";
  }

  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function WorkflowBadge({ status, compact = false }) {
  const meta = STATUS_META[status] || {label: status, color:"badge-gray"};

  if (compact) {
    return <span className={`badge ${meta.color}`}>{meta.label}</span>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-0">
        {WORKFLOW_STEPS.map((step, i) => {
          const state = stepState(step.key, status);
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className={`flex flex-col items-center`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${state === "done"     ? "bg-emerald-500 text-white"
                  : state === "active"   ? "bg-blue-500 text-white animate-pulse"
                  : state === "rejected" ? "bg-red-500 text-white"
                  :                        "bg-slate-200 text-slate-400"}`}>
                  {state === "done"     ? <Check size={13}/> :
                   state === "rejected" ? <X size={13}/> :
                   state === "active"   ? <Clock size={11}/> :
                   i + 1}
                </div>
                <span className={`text-[9px] mt-1 text-center leading-tight whitespace-nowrap
                  ${state === "done"     ? "text-emerald-600 font-medium"
                  : state === "active"   ? "text-blue-600 font-semibold"
                  : state === "rejected" ? "text-red-500 font-medium"
                  :                        "text-slate-400"}`}>
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-[-14px]
                  ${state === "done" ? "bg-emerald-400" : "bg-slate-200"}`}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}