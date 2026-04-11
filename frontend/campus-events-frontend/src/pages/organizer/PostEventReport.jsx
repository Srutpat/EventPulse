import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";

export default function PostEventReport({ onLogout }) {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [event,   setEvent]   = useState(null);
  const [form,    setForm]    = useState({ eventReport:"", actualExpenditure:"", reimbursementDetails:"" });
  const [loading, setLoading] = useState(false);
  const [fetching,setFetching]= useState(true);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => {
        setEvent(r.data);
        setForm({
          eventReport:          r.data.eventReport          || "",
          actualExpenditure:    r.data.actualExpenditure    ?? "",
          reimbursementDetails: r.data.reimbursementDetails || "",
        });
      })
      .catch(() => setError("Event not found."))
      .finally(() => setFetching(false));
  }, [id]);

  const set = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventReport.trim()) { setError("Event report is required."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await api.post(`/events/${id}/post-event`, {
        eventReport:          form.eventReport,
        actualExpenditure:    form.actualExpenditure ? parseFloat(form.actualExpenditure) : null,
        reimbursementDetails: form.reimbursementDetails,
      });
      setSuccess("Post-event report submitted successfully!");
      setTimeout(() => navigate("/organizer"), 1800);
    } catch (err) {
      setError(err.response?.data || "Failed to submit report.");
    } finally { setLoading(false); }
  };

  if (fetching) return <DashboardLayout onLogout={onLogout}><div className="text-center text-slate-400 mt-20 text-sm">Loading…</div></DashboardLayout>;

  const budgetVariance = event?.estimatedBudget && form.actualExpenditure
    ? parseFloat(form.actualExpenditure) - event.estimatedBudget
    : null;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Post-Event Report" subtitle={event?.title || ""}/>

      <div className="max-w-2xl">

        {/* Budget comparison card */}
        {event?.estimatedBudget && (
          <div className="glass-card p-5 mb-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Estimated Budget</p>
              <p className="text-lg font-bold text-slate-700">₹{event.estimatedBudget.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Actual Spent</p>
              <p className="text-lg font-bold text-slate-700">
                {form.actualExpenditure ? `₹${parseFloat(form.actualExpenditure).toLocaleString("en-IN")}` : "—"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Variance</p>
              {budgetVariance !== null ? (
                <p className={`text-lg font-bold ${budgetVariance > 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {budgetVariance > 0 ? "+" : ""}₹{Math.abs(budgetVariance).toLocaleString("en-IN")}
                </p>
              ) : <p className="text-lg font-bold text-slate-300">—</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
          {error   && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {success}</div>}

          <div>
            <label className="field-label">Event Report <span className="text-red-500">*</span></label>
            <p className="text-xs text-slate-400 mb-1">Describe how the event went — highlights, learnings, participation, outcomes.</p>
            <textarea name="eventReport" value={form.eventReport} onChange={set} required
              rows={6} placeholder="The event was attended by 80 students…"
              className="input resize-none"/>
          </div>

          <div>
            <label className="field-label">Actual Expenditure (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
              <input name="actualExpenditure" type="number" min="0" value={form.actualExpenditure}
                onChange={set} placeholder="0" className="input pl-8"/>
            </div>
          </div>

          <div>
            <label className="field-label">Reimbursement Details</label>
            <p className="text-xs text-slate-400 mb-1">List bills/receipts, amounts, and who paid what.</p>
            <textarea name="reimbursementDetails" value={form.reimbursementDetails} onChange={set}
              rows={4} placeholder="Bill 1: Venue – ₹5000 (paid by organizer)&#10;Bill 2: Food – ₹3000 (paid by club)"
              className="input resize-none"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn flex-1 py-2.5">
              {loading ? "Submitting…" : "Submit Report"}
            </button>
            <button type="button" onClick={() => navigate("/organizer")} className="btn-outline px-6 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}