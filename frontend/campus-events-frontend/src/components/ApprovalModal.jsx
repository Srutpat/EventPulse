import { useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function ApprovalModal({ eventTitle, onClose, onSubmit, loading }) {
  const [action,  setAction]  = useState("");
  const [comment, setComment] = useState("");

  const needsComment = action === "REJECT";
  const canSubmit    = action && (!needsComment || comment.trim().length > 5);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ action, comment });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="glass-card w-full max-w-md p-7 shadow-2xl animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Review Event</h3>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => setAction("APPROVE")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2
              font-medium text-sm transition-all
              ${action === "APPROVE"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:border-emerald-300"}`}>
            <CheckCircle size={18} /> Approve
          </button>
          <button onClick={() => setAction("REJECT")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2
              font-medium text-sm transition-all
              ${action === "REJECT"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-slate-200 text-slate-500 hover:border-red-300"}`}>
            <XCircle size={18} /> Reject / Revert
          </button>
        </div>

        {/* Comment */}
        <div className="mb-5">
          <label className="field-label">
            {needsComment ? "Reason for rejection *" : "Comment (optional)"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={needsComment
              ? "Please explain what needs to be changed…"
              : "Add any notes for the organizer…"}
            rows={3}
            className="input resize-none"
          />
          {needsComment && comment.trim().length < 6 && (
            <p className="text-xs text-red-400 mt-1">Reason required to reject.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`btn flex-1 py-2.5 ${action === "REJECT" ? "!bg-red-500 hover:!bg-red-600" : ""}`}>
            {loading ? "Submitting…" : `Confirm ${action === "APPROVE" ? "Approval" : "Rejection"}`}
          </button>
          <button onClick={onClose} className="btn-outline px-5">Cancel</button>
        </div>
      </div>
    </div>
  );
}