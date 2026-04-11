import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import { DEPARTMENTS, CATEGORIES, CLUBS } from "../../constants";
import { Info, IndianRupee, Phone, PlusCircle, Trash2, Globe, Users, Calendar } from "lucide-react";

const EMPTY_FORM = {
  title:"", description:"", location:"", department:"",
  category:"", clubName:"", clubWebsite:"",
  startDate:"", endDate:"", registrationDeadline:"",
  maxParticipants:"", entryFee:"", prizePool:"", goodies:"",
};

const TABS = [
  { id:"details",      label:"Event Details", icon:Info         },
  { id:"coordinators", label:"Coordinators",  icon:Phone        },
  { id:"extras",       label:"Fees & Prizes", icon:IndianRupee  },
];

export default function CreateEvent({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const { id }   = useParams();

  const [form,         setForm]         = useState(EMPTY_FORM);
  const [coordinators, setCoordinators] = useState([{ name:"", contact:"" }]);
  const [tab,          setTab]          = useState("details");
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(!!id);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`)
      .then(r => {
        const e = r.data;
        setForm({
          title:               e.title              || "",
          description:         e.description        || "",
          location:            e.location           || "",
          department:          e.department         || "",
          category:            e.category           || "",
          clubName:            e.clubName           || "",
          clubWebsite:         e.clubWebsite        || "",
          startDate:           e.startDate          ? e.startDate.slice(0,16)                : "",
          endDate:             e.endDate            ? e.endDate.slice(0,16)                  : "",
          registrationDeadline:e.registrationDeadline ? e.registrationDeadline.slice(0,16) : "",
          maxParticipants:     e.maxParticipants    || "",
          entryFee:            e.entryFee           ?? "",
          prizePool:           e.prizePool          ?? "",
          goodies:             e.goodies            || "",
        });
        // Load coordinators
        if (e.coordinatorsJson) {
          try { setCoordinators(JSON.parse(e.coordinatorsJson)); }
          catch { setCoordinators([{ name: e.coordinatorName||"", contact: e.coordinatorContact||"" }]); }
        } else if (e.coordinatorName) {
          setCoordinators([{ name: e.coordinatorName, contact: e.coordinatorContact || "" }]);
        }
      })
      .catch(() => setError("Failed to load event."))
      .finally(() => setFetching(false));
  }, [id]);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Coordinator helpers
  const addCoordinator    = () => setCoordinators(c => [...c, { name:"", contact:"" }]);
  const removeCoordinator = (i) => setCoordinators(c => c.filter((_, idx) => idx !== i));
  const setCoord          = (i, field, val) =>
    setCoordinators(c => c.map((coord, idx) => idx === i ? { ...coord, [field]: val } : coord));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.startDate) {
      setError("Title, location and start date are required."); return;
    }
    const validCoords = coordinators.filter(c => c.name.trim());
    if (validCoords.length === 0) {
      setError("At least one coordinator name is required."); return;
    }

    setLoading(true); setError(""); setSuccess("");
    const toISO = s => s ? s + ":00" : null;

    const payload = {
      ...form,
      organizerId:          user.id,
      startDate:            toISO(form.startDate),
      endDate:              toISO(form.endDate),
      registrationDeadline: toISO(form.registrationDeadline),
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants)   : null,
      entryFee:        form.entryFee        ? parseFloat(form.entryFee)        : null,
      prizePool:       form.prizePool       ? parseFloat(form.prizePool)       : null,
      // Coordinators: save as JSON string + first coord in legacy fields
      coordinatorsJson:    JSON.stringify(validCoords),
      coordinatorName:     validCoords[0]?.name    || "",
      coordinatorContact:  validCoords[0]?.contact || "",
    };

    try {
      if (id) {
        await api.put(`/events/${id}`, payload);
        setSuccess("Event updated and resubmitted to Faculty Advisor!");
      } else {
        await api.post("/events", payload);
        setSuccess("Event submitted to Faculty Advisor for review!");
        setForm(EMPTY_FORM);
        setCoordinators([{ name:"", contact:"" }]);
      }
      setTimeout(() => navigate("/organizer"), 1800);
    } catch (err) {
      setError(err.response?.data || "Failed to save event.");
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <DashboardLayout onLogout={onLogout}>
      <div className="text-center text-slate-400 mt-20 text-sm">Loading event…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader
        title={id ? "Edit Event" : "Create New Event"}
        subtitle={id ? "Update details and resubmit for approval" : "Your event will go to Faculty Advisor for review"}
      />

      <div className="max-w-2xl">
        {/* Tab bar */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ id:tid, label, icon:Icon }) => (
            <button key={tid} type="button" onClick={() => setTab(tid)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition
                ${tab === tid
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
          {error   && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {success}</div>}

          {/* ── DETAILS TAB ── */}
          {tab === "details" && (
            <>
              <div>
                <label className="field-label">Event Title <span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={set} required
                  placeholder="e.g. National Level Hackathon 2025" className="input"/>
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea name="description" value={form.description} onChange={set}
                  rows={4} placeholder="What is this event about? Who should participate?"
                  className="input resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Location <span className="text-red-500">*</span></label>
                  <input name="location" value={form.location} onChange={set} required
                    placeholder="e.g. Seminar Hall A" className="input"/>
                </div>
                <div>
                  <label className="field-label">Department</label>
                  <select name="department" value={form.department} onChange={set} className="input">
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Category</label>
                  <select name="category" value={form.category} onChange={set} className="input">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Organising Club</label>
                  <select name="clubName" value={form.clubName} onChange={set} className="input">
                    <option value="">Select club</option>
                    {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label"><Globe size={12} className="inline mr-1"/>Club Website (optional)</label>
                <input name="clubWebsite" value={form.clubWebsite} onChange={set}
                  type="url" placeholder="https://techclub.college.edu" className="input"/>
              </div>
              <div>
                <label className="field-label">
                  <Calendar size={12} className="inline mr-1"/>
                  Event Dates <span className="text-red-500">*</span>
                  <span className="text-slate-400 font-normal ml-1">(supports multi-day)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Start Date & Time</p>
                    <input name="startDate" type="datetime-local" value={form.startDate}
                      onChange={set} required className="input"/>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">End Date & Time (multi-day)</p>
                    <input name="endDate" type="datetime-local" value={form.endDate}
                      min={form.startDate} onChange={set} className="input"/>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Registration Deadline</label>
                  <input name="registrationDeadline" type="datetime-local"
                    value={form.registrationDeadline} onChange={set} className="input"/>
                </div>
                <div>
                  <label className="field-label"><Users size={12} className="inline mr-1"/>Max Participants</label>
                  <input name="maxParticipants" type="number" min="1"
                    value={form.maxParticipants} onChange={set}
                    placeholder="Unlimited if blank" className="input"/>
                </div>
              </div>
            </>
          )}

          {/* ── COORDINATORS TAB ── */}
          {tab === "coordinators" && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <p className="font-medium mb-1">Event Coordinators</p>
                <p className="text-xs">Add all team members who will coordinate this event. Their contact details will be visible to students and faculty.</p>
              </div>

              <div className="space-y-3">
                {coordinators.map((coord, i) => (
                  <div key={i} className="glass-card p-4 flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="field-label">Name {i === 0 && <span className="text-red-500">*</span>}</label>
                        <input
                          value={coord.name}
                          onChange={e => setCoord(i, "name", e.target.value)}
                          placeholder="Full name"
                          required={i === 0}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="field-label">Phone / Email</label>
                        <input
                          value={coord.contact}
                          onChange={e => setCoord(i, "contact", e.target.value)}
                          placeholder="Contact info"
                          className="input"
                        />
                      </div>
                    </div>
                    {coordinators.length > 1 && (
                      <button type="button" onClick={() => removeCoordinator(i)}
                        className="btn-danger p-2 mt-5 shrink-0">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" onClick={addCoordinator}
                className="btn-outline flex items-center gap-2 self-start">
                <PlusCircle size={15}/> Add Another Coordinator
              </button>
            </>
          )}

          {/* ── EXTRAS TAB ── */}
          {tab === "extras" && (
            <>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                All fields optional. Entry fee and prize details are shown to students.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Entry Fee (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
                    <input name="entryFee" type="number" min="0" step="0.01"
                      value={form.entryFee} onChange={set} placeholder="0 = Free" className="input pl-8"/>
                  </div>
                </div>
                <div>
                  <label className="field-label">Prize Pool (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
                    <input name="prizePool" type="number" min="0" step="0.01"
                      value={form.prizePool} onChange={set} placeholder="Optional" className="input pl-8"/>
                  </div>
                </div>
              </div>
              <div>
                <label className="field-label">Goodies / Perks for Participants</label>
                <input name="goodies" value={form.goodies} onChange={set}
                  placeholder="e.g. T-shirt, Certificate, Meal voucher, Swag kit" className="input"/>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn flex-1 py-2.5">
              {loading
                ? "Submitting…"
                : id ? "Save & Resubmit to Faculty" : "Submit for Faculty Review"}
            </button>
            <button type="button" onClick={() => navigate("/organizer")} className="btn-outline flex-1 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}