import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import { FileText, Upload, AlertCircle } from "lucide-react";

function eventHasEnded(ev) {
  const endDt = ev?.endDate || ev?.startDate || ev?.eventDate;
  if (!endDt) return false;
  return new Date(endDt) < new Date();
}

export default function PostEventReport({ onLogout }) {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [event,    setEvent]    = useState(null);
  const [form,     setForm]     = useState({
    eventReport: "", actualExpenditure: "", reimbursementDetails: ""
  });
  const [reportFile,  setReportFile]  = useState(null);  // optional file upload
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  useEffect(() => {
    // ✅ Correct useEffect pattern
    function load() {
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
    }
    load();
  }, [id]);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }
    setReportFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventReport.trim() && !reportFile) {
      setError("Please enter a report or upload a file."); return;
    }
    setLoading(true); setError(""); setSuccess("");

    try {
      // If a file is uploaded, read it as base64 and include filename in report text
      let reportText = form.eventReport;
      if (reportFile) {
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(reportFile);
        });
        // Append file info to report — in a real system you'd upload to S3/Supabase Storage
        reportText = `${reportText}\n\n[Attached file: ${reportFile.name}]\n${base64.substring(0, 100)}...`;
      }

      await api.post(`/events/${id}/post-event`, {
        eventReport:          reportText,
        actualExpenditure:    form.actualExpenditure ? parseFloat(form.actualExpenditure) : null,
        reimbursementDetails: form.reimbursementDetails,
      });

      setSuccess("Post-event report submitted successfully!");
      setTimeout(() => navigate("/organizer"), 1800);
    } catch (err) {
      setError(err.response?.data || "Failed to submit report.");
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <DashboardLayout onLogout={onLogout}>
      <div className="text-center text-slate-400 mt-20 text-sm">Loading…</div>
    </DashboardLayout>
  );

  // ── Block access if event hasn't ended yet ──────────────────────────────────
  if (event && !eventHasEnded(event)) {
    const endDt = event.endDate || event.startDate || event.eventDate;
    return (
      <DashboardLayout onLogout={onLogout}>
        <PageHeader title="Post-Event Report" subtitle={event.title}/>
        <div className="max-w-2xl">
          <div className="glass-card p-8 text-center">
            <AlertCircle size={40} className="text-amber-400 mx-auto mb-4"/>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Event hasn't ended yet</h3>
            <p className="text-slate-500 text-sm mb-2">
              Post-event reports can only be submitted after the event has concluded.
            </p>
            {endDt && (
              <p className="text-xs text-slate-400 mb-6">
                Event ends: {new Date(endDt).toLocaleString("en-IN", {
                  day:"numeric", month:"short", year:"numeric",
                  hour:"2-digit", minute:"2-digit"
                })}
              </p>
            )}
            <button onClick={() => navigate("/organizer")} className="btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const budgetVariance = event?.estimatedBudget && form.actualExpenditure
    ? parseFloat(form.actualExpenditure) - event.estimatedBudget
    : null;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Post-Event Report" subtitle={event?.title || ""}/>

      <div className="max-w-2xl">

        {/* Budget comparison */}
        {event?.estimatedBudget && (
          <div className="glass-card p-5 mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">Estimated Budget</p>
              <p className="text-lg font-bold text-slate-700">
                ₹{event.estimatedBudget.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Actual Spent</p>
              <p className="text-lg font-bold text-slate-700">
                {form.actualExpenditure
                  ? `₹${parseFloat(form.actualExpenditure).toLocaleString("en-IN")}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Variance</p>
              {budgetVariance !== null ? (
                <p className={`text-lg font-bold ${budgetVariance > 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {budgetVariance > 0 ? "+" : ""}
                  ₹{Math.abs(budgetVariance).toLocaleString("en-IN")}
                </p>
              ) : <p className="text-lg font-bold text-slate-300">—</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
          {error   && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {success}</div>}

          {/* Text report */}
          <div>
            <label className="field-label">
              <FileText size={13} className="inline mr-1"/>
              Event Report <span className="text-slate-400 font-normal">(text)</span>
            </label>
            <p className="text-xs text-slate-400 mb-1">
              Describe how the event went — highlights, attendance count, outcomes, learnings.
            </p>
            <textarea name="eventReport" value={form.eventReport} onChange={set}
              rows={6}
              placeholder="The event was held on [date] and attended by [N] students. Key highlights include..."
              className="input resize-none"/>
          </div>

          {/* File upload */}
          <div>
            <label className="field-label">
              <Upload size={13} className="inline mr-1"/>
              Upload Report File <span className="text-slate-400 font-normal">(optional, max 5MB)</span>
            </label>
            <div className={`mt-1 border-2 border-dashed rounded-xl p-4 text-center transition
              ${reportFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input
                type="file"
                id="reportFile"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="reportFile" className="cursor-pointer">
                {reportFile ? (
                  <div>
                    <p className="text-sm font-medium text-emerald-700">✓ {reportFile.name}</p>
                    <p className="text-xs text-emerald-500 mt-0.5">
                      {(reportFile.size / 1024).toFixed(0)} KB — click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload size={20} className="text-slate-300 mx-auto mb-1"/>
                    <p className="text-sm text-slate-500">
                      Click to upload PDF, Word doc, or image
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">PDF · DOC · DOCX · JPG · PNG</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Actual expenditure */}
          <div>
            <label className="field-label">Actual Expenditure (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
              <input name="actualExpenditure" type="number" min="0" step="0.01"
                value={form.actualExpenditure} onChange={set}
                placeholder="Total amount actually spent" className="input pl-8"/>
            </div>
          </div>

          {/* Reimbursement details */}
          <div>
            <label className="field-label">Reimbursement Details</label>
            <p className="text-xs text-slate-400 mb-1">
              List all bills, receipts, who paid, and reimbursement requests.
            </p>
            <textarea name="reimbursementDetails" value={form.reimbursementDetails} onChange={set}
              rows={4}
              placeholder={`Bill 1: Venue rental – ₹5,000 (paid by organizer, reimbursement requested)\nBill 2: Refreshments – ₹3,000 (paid by club fund, no reimbursement needed)`}
              className="input resize-none"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn flex-1 py-2.5">
              {loading ? "Submitting…" : (event?.eventReport ? "Update Report" : "Submit Report")}
            </button>
            <button type="button" onClick={() => navigate("/organizer")}
              className="btn-outline px-6 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}