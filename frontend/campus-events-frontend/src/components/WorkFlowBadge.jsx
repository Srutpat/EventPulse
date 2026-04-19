import { Check, X, Clock, Circle } from "lucide-react";
import { STATUS_META } from "../constants";

const STEPS = [
  { key:"PENDING_FACULTY",  label:"Faculty"  },
  { key:"FACULTY_APPROVED", label:"✓ Faculty" },
  { key:"PENDING_SDW",      label:"SDW"      },
  { key:"SDW_APPROVED",     label:"✓ SDW"    },
  { key:"PENDING_HOD",      label:"HoD"      },
  { key:"APPROVED",         label:"✓ Live"   },
];

const REJECTED_AT = {
  FACULTY_REJECTED: 0,
  SDW_REJECTED:     2,
  HOD_REJECTED:     4,
};

function stepState(stepIdx, currentStatus) {
  if (currentStatus === "APPROVED") return "done";

  const rejIdx = REJECTED_AT[currentStatus];
  if (rejIdx !== undefined) {
    if (stepIdx < rejIdx)  return "done";
    if (stepIdx === rejIdx) return "rejected";
    return "pending";
  }

  // Map current status to step index
  // Map: which step index is currently ACTIVE (being waited on)
  // "done" = completed, "active" = currently pending/waiting, "pending" = not reached
  const activeStep = {
    PENDING_FACULTY:  0,   // waiting for faculty → step 0 is active
    FACULTY_APPROVED: 2,   // faculty done → waiting for SDW (after budget submit) → step 2
    PENDING_SDW:      2,   // same — waiting at SDW
    SDW_APPROVED:     4,   // SDW done → waiting for HoD → step 4
    PENDING_HOD:      4,   // waiting at HoD
  };
  // "done" boundary: which steps are fully completed
  const doneUpTo = {
    PENDING_FACULTY:  -1,  // nothing done yet
    FACULTY_APPROVED: 1,   // steps 0 and 1 done
    PENDING_SDW:      1,   // same
    SDW_APPROVED:     3,   // steps 0,1,2,3 done
    PENDING_HOD:      3,   // same
  };
  const active = activeStep[currentStatus] ?? -1;
  const done   = doneUpTo[currentStatus]  ?? -1;
  if (stepIdx <= done)   return "done";
  if (stepIdx === active) return "active";
  return "pending";
}

export default function WorkFlowBadge({ status, compact = false }) {
  const meta = STATUS_META[status] || { label: status, color: "badge-gray" };

  if (compact) {
    return <span className={`badge ${meta.color}`}>{meta.label}</span>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const state = stepState(i, status);
          return (
            <div key={step.key} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              {/* Node */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                  ${state === "done"     ? "bg-indigo-500 shadow-md shadow-indigo-200"
                  : state === "active"   ? "bg-amber-400 shadow-md shadow-amber-200 animate-pulse"
                  : state === "rejected" ? "bg-red-500 shadow-md shadow-red-200"
                  :                        "bg-slate-200"}`}>
                  {state === "done"     ? <Check size={11} className="text-white"/>  :
                   state === "rejected" ? <X size={11} className="text-white"/>      :
                   state === "active"   ? <Clock size={10} className="text-white"/>  :
                   <Circle size={8} className="text-slate-400"/>}
                </div>
                <span className={`text-[9px] mt-1 text-center whitespace-nowrap font-medium leading-tight
                  ${state === "done"     ? "text-indigo-600"
                  : state === "active"   ? "text-amber-600"
                  : state === "rejected" ? "text-red-500"
                  :                        "text-slate-400"}`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all duration-500
                  ${state === "done" ? "bg-indigo-400" : "bg-slate-200"}`}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}