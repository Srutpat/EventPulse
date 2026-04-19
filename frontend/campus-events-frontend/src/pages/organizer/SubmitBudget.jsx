import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getStatus } from "../../utils";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { IndianRupee, CheckCircle } from "lucide-react";

const EMPTY_BUDGET = {
  estimatedBudget: "",
  venueExpense: "",
  foodExpense: "",
  decorExpense: "",
  printingExpense: "",
  otherExpense: "",
  budgetNotes: "",
};

export default function SubmitBudget({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_BUDGET);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => {
        const e = r.data;
        setEvent(e);

        // ✅ FIXED: use getStatus
        if (getStatus(e) !== "FACULTY_APPROVED") {
          setError("Budget can only be submitted after Faculty Advisor approves the event.");
        }

        setForm({
          estimatedBudget: e.estimatedBudget ?? "",
          venueExpense: e.venueExpense ?? "",
          foodExpense: e.foodExpense ?? "",
          decorExpense: e.decorExpense ?? "",
          printingExpense: e.printingExpense ?? "",
          otherExpense: e.otherExpense ?? "",
          budgetNotes: e.budgetNotes || "",
        });
      })
      .catch(() => setError("Event not found."))
      .finally(() => setFetching(false));
  }, [id]);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const num = v => v ? parseFloat(v) : null;

  const computedTotal = ["venueExpense", "foodExpense", "decorExpense", "printingExpense", "otherExpense"]
    .reduce((s, k) => s + (parseFloat(form[k]) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.estimatedBudget) {
      setError("Total budget is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/events/${id}/budget`, {
        estimatedBudget: num(form.estimatedBudget),
        venueExpense: num(form.venueExpense),
        foodExpense: num(form.foodExpense),
        decorExpense: num(form.decorExpense),
        printingExpense: num(form.printingExpense),
        otherExpense: num(form.otherExpense),
        budgetNotes: form.budgetNotes,
      });

      setSuccess("Budget submitted! Event forwarded to SDW Coordinator.");
      setTimeout(() => navigate("/organizer"), 1800);

    } catch (err) {
      setError(err.response?.data || "Failed to submit budget.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout onLogout={onLogout}>
        <div className="text-center text-slate-400 mt-20 text-sm">Loading…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Submit Budget" subtitle={event?.title || ""} />

      {/* ✅ FIXED: use getStatus */}
      {getStatus(event) === "FACULTY_APPROVED" && (
        <div className="max-w-2xl mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Faculty Advisor approved your event!
            </p>
            <p className="text-xs text-emerald-600">
              Submit your budget below. It will be reviewed by the SDW Coordinator.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {success}</div>}

          <div>
            <label className="field-label">
              Total Estimated Budget (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
              <input
                name="estimatedBudget"
                type="number"
                min="0"
                value={form.estimatedBudget}
                onChange={set}
                placeholder="0"
                required
                className="input pl-8"
              />
            </div>
          </div>

          <div>
            <label className="field-label mb-2">Expense Breakdown</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "venueExpense", label: "Venue / Hall" },
                { name: "foodExpense", label: "Food & Refreshments" },
                { name: "decorExpense", label: "Decorations & Setup" },
                { name: "printingExpense", label: "Printing / Banners" },
                { name: "otherExpense", label: "Other Expenses" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">₹</span>
                    <input
                      name={name}
                      type="number"
                      min="0"
                      value={form[name]}
                      onChange={set}
                      placeholder="0"
                      className="input pl-7 text-sm"
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-col justify-end">
                <p className="text-xs text-slate-500 mb-1">Breakdown Total</p>
                <div className={`input font-semibold ${
                  computedTotal > 0 && form.estimatedBudget &&
                  Math.abs(computedTotal - parseFloat(form.estimatedBudget)) > 1
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}>
                  ₹ {computedTotal.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {computedTotal > 0 && form.estimatedBudget &&
              Math.abs(computedTotal - parseFloat(form.estimatedBudget)) > 1 && (
                <p className="text-xs text-amber-500 mt-2">
                  ⚠ Breakdown (₹{computedTotal.toLocaleString()}) doesn't match total budget. Please verify.
                </p>
              )}
          </div>

          <div>
            <label className="field-label">Budget Justification / Notes</label>
            <textarea
              name="budgetNotes"
              value={form.budgetNotes}
              onChange={set}
              rows={3}
              placeholder="Explain how the budget will be used, any sponsorships, etc."
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || getStatus(event) !== "FACULTY_APPROVED"}
              className="btn flex-1 py-2.5"
            >
              {loading ? "Submitting…" : "Submit Budget to SDW"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/organizer")}
              className="btn-outline px-6 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}