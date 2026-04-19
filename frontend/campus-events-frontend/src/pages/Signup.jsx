import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Zap, Check, ChevronRight, ChevronLeft } from "lucide-react";

/* ── Master data — dropdowns ─────────────────────────────────────── */
const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Instrumentation Engineering",
  "Artificial Intelligence & Data Science",
  "First Year Engineering",
];

const CLUBS = {
  "Computer Science & Engineering": ["CSI","GDSC","CodeChef Campus","Cybersecurity Club"],
  "Information Technology":         ["IT Association","Web Dev Club","Open Source Club"],
  "Electronics & Telecommunication":["IEEE","ISTE","Electronics Club"],
  "Mechanical Engineering":         ["MESA","SAE India","CAD/CAM Club"],
  "Civil Engineering":              ["Civil Association","Structural Club"],
  "Electrical Engineering":         ["IETE","Power Systems Club"],
  "First Year Engineering":         ["First Year Council"],
  "central":                        ["NSS","Cultural Committee","Sports Committee","NCC","Entrepreneurship Cell"],
};

const ALL_CLUBS = [...new Set(Object.values(CLUBS).flat())].sort();
const YEARS     = ["FE","SE","TE","BE"];
const DIVISIONS = ["A","B","C","D","E"];

const ROLES = [
  { value:"STUDENT",         label:"Student",           desc:"Register for events, track registrations",    emoji:"🎓" },
  { value:"ORGANIZER",       label:"Event Organizer",   desc:"Create and manage club events",               emoji:"🎯" },
  { value:"FACULTY_ADVISOR", label:"Faculty Advisor",   desc:"Review and approve event proposals",          emoji:"👨‍🏫" },
  { value:"SDW_COORDINATOR", label:"SDW Coordinator",   desc:"Budget review and HoD forwarding",            emoji:"📋" },
  { value:"HOD",             label:"Head of Department",desc:"Final event approval authority",              emoji:"👑" },
];

/* ── Reusable field components ───────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}
function Input({ label, required, ...props }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input {...props} required={required}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
    </div>
  );
}
function Select({ label, required, options, placeholder, ...props }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select {...props} required={required}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          transition-all appearance-none cursor-pointer">
        <option value="">{placeholder || "Select…"}</option>
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.value}
            value={typeof o === "string" ? o : o.value}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Step indicator ─────────────────────────────────────────────── */
function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`transition-all duration-300 rounded-full
          ${i === current ? "w-6 h-2 bg-indigo-500" :
            i < current  ? "w-2 h-2 bg-indigo-300" :
                           "w-2 h-2 bg-slate-200"}`} />
      ))}
    </div>
  );
}

/* ── Main Signup component ─────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(0);   // 0=role, 1=common, 2=role-specific
  const [role,    setRole]    = useState("");
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const setField = (k) => (e) => {
  const value = e.target.value;
  setForm(prev => {
    if (prev[k] === value) return prev; // prevent unnecessary re-render
    return { ...prev, [k]: value };
  });
};

  const totalSteps = 3;

  /* ── Step 0: choose role ── */
  const StepRole = () => (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Who are you?</h2>
      <p className="text-slate-400 text-sm mb-5">Select your role to get started</p>
      <div className="space-y-3">
        {ROLES.map(r => (
          <button key={r.value} type="button"
            onClick={() => { setRole(r.value); setError(""); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
              ${role === r.value
                ? "border-indigo-500 bg-indigo-50 shadow-md"
                : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}>
            <span className="text-2xl">{r.emoji}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${role === r.value ? "text-indigo-700" : "text-slate-800"}`}>
                {r.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
            </div>
            {role === r.value && (
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Step 1: common fields (all roles) ── */
  function StepCommon({ form, setField }) {
  return (
    <Input
      label="Full Name"
      value={form.name || ""}
      onChange={setField("name")}
    />
  );
}
  /* ── Step 2: role-specific fields ── */
  const StepRoleFields = () => {
    if (role === "STUDENT") return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Student Info</h2>
          <p className="text-slate-400 text-sm mb-4">Your academic details</p>
        </div>
        <Input label="PRN (Permanent Registration Number)" required placeholder="e.g. 1234567890"
          value={form.prn || ""} onChange={e => set("prn", e.target.value)} />
        <Select label="Department" required placeholder="Select your department"
          options={DEPARTMENTS} value={form.department || ""}
          onChange={e => set("department", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Year" required placeholder="Select year"
            options={YEARS} value={form.year || ""}
            onChange={e => set("year", e.target.value)} />
          <Select label="Division" required placeholder="Select division"
            options={DIVISIONS} value={form.division || ""}
            onChange={e => set("division", e.target.value)} />
        </div>
      </div>
    );

    if (role === "ORGANIZER") return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Organizer Info</h2>
          <p className="text-slate-400 text-sm mb-4">Your club and department details</p>
        </div>
        <Select label="Your Department" required placeholder="Select your department"
          options={DEPARTMENTS} value={form.department || ""}
          onChange={e => set("department", e.target.value)} />
        <div>
          <Label required>Club Type</Label>
          <div className="flex gap-2">
            {[
              { val:"department", label:"🏢 Department Club" },
              { val:"central",    label:"🏫 Central Level Club" },
            ].map(opt => (
              <button key={opt.val} type="button"
                onClick={() => { set("_clubType", opt.val); set("clubDepartment", opt.val === "central" ? "central" : ""); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all
                  ${form._clubType === opt.val
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {form._clubType === "central" ? (
          <Select label="Club Name" required placeholder="Select central club"
            options={CLUBS.central} value={form.clubName || ""}
            onChange={e => { set("clubName", e.target.value); set("clubDepartment","central"); }} />
        ) : form._clubType === "department" ? (
          <>
            <Select label="Club Department" required placeholder="Select club's department"
              options={DEPARTMENTS} value={form.clubDepartment || ""}
              onChange={e => set("clubDepartment", e.target.value)} />
            {form.clubDepartment && (
              <Select label="Club Name" required placeholder="Select club"
                options={[...(CLUBS[form.clubDepartment] || []), "Other"]}
                value={form.clubName || ""}
                onChange={e => set("clubName", e.target.value)} />
            )}
            {form.clubName === "Other" && (
              <Input label="Enter Club Name" required placeholder="Type club name"
                value={form._customClub || ""}
                onChange={e => { set("_customClub", e.target.value); set("clubName", e.target.value); }} />
            )}
          </>
        ) : (
          <p className="text-xs text-amber-500">↑ Please select club type first</p>
        )}
      </div>
    );

    if (role === "FACULTY_ADVISOR") return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Faculty Info</h2>
          <p className="text-slate-400 text-sm mb-4">Your department and club details</p>
        </div>
        <Select label="Department" required placeholder="Select your department"
          options={DEPARTMENTS} value={form.department || ""}
          onChange={e => set("department", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Subject" required placeholder="e.g. Data Structures"
            value={form.subject || ""} onChange={e => set("subject", e.target.value)} />
          <Input label="Specialization" required placeholder="e.g. AI/ML"
            value={form.specialization || ""} onChange={e => set("specialization", e.target.value)} />
        </div>
        <div>
          <Label required>Club(s) you advise</Label>
          <p className="text-xs text-slate-400 mb-2">Select one or more clubs. Hold Ctrl/Cmd to multi-select.</p>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2">
            {ALL_CLUBS.map(club => (
              <label key={club} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="checkbox"
                  checked={(form.clubNames || "").split(",").map(c=>c.trim()).filter(Boolean).includes(club)}
                  onChange={e => {
                    const current = (form.clubNames || "").split(",").map(c=>c.trim()).filter(Boolean);
                    const updated = e.target.checked
                      ? [...current, club]
                      : current.filter(c => c !== club);
                    set("clubNames", updated.join(", "));
                  }}
                  className="rounded border-slate-300" />
                <span className="text-sm text-slate-700">{club}</span>
              </label>
            ))}
          </div>
          {form.clubNames && (
            <p className="text-xs text-indigo-600 mt-1.5 font-medium">
              Selected: {form.clubNames}
            </p>
          )}
        </div>
      </div>
    );

    if (role === "SDW_COORDINATOR") return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">SDW Coordinator Info</h2>
          <p className="text-slate-400 text-sm mb-4">Your role in the student welfare division</p>
        </div>
        <div>
          <Label>Department</Label>
          <p className="text-xs text-amber-600 mb-2 font-medium">
            ⚠ Leave blank if you are the <strong>SDW Dean</strong> — you'll see ALL departments
            including central events (NSS etc.)
          </p>
          <Select placeholder="Leave blank if SDW Dean / Overall"
            options={DEPARTMENTS} value={form.department || ""}
            onChange={e => set("department", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Subject" required placeholder="e.g. Management"
            value={form.subject || ""} onChange={e => set("subject", e.target.value)} />
          <Input label="Specialization" required placeholder="e.g. Event Mgmt"
            value={form.specialization || ""} onChange={e => set("specialization", e.target.value)} />
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <p className="text-xs text-indigo-700">
            <strong>Dept SDW:</strong> Sees only events from your department.<br/>
            <strong>SDW Dean (no dept):</strong> Sees all events including NSS/central.
          </p>
        </div>
      </div>
    );

    if (role === "HOD") return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Head of Department Info</h2>
          <p className="text-slate-400 text-sm mb-4">Final approval authority for your department</p>
        </div>
        <Select label="Department" required placeholder="Select your department"
          options={DEPARTMENTS} value={form.department || ""}
          onChange={e => set("department", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Subject" required placeholder="e.g. Computer Networks"
            value={form.subject || ""} onChange={e => set("subject", e.target.value)} />
          <Input label="Specialization" required placeholder="e.g. Systems"
            value={form.specialization || ""} onChange={e => set("specialization", e.target.value)} />
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
          <p className="text-xs text-rose-700">
            You are the final approval authority. Events in your department will require
            your sign-off before going live to students.
          </p>
        </div>
      </div>
    );

    return null;
  };

  /* ── Validation per step ── */
  const canProceed = () => {
    if (step === 0) return !!role;
    if (step === 1) return !!(form.name && form.email && form.password && form.mobileNumber);
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setLoading(true); setError("");

    // Validate role-specific required fields
    if (role === "STUDENT" && (!form.prn || !form.department || !form.year)) {
      setError("Please fill all required fields: PRN, Department, and Year.");
      setLoading(false); return;
    }
    if (role === "ORGANIZER" && (!form.clubName || !form.clubDepartment)) {
      setError("Please select your club name and club department.");
      setLoading(false); return;
    }
    if (role === "FACULTY_ADVISOR" && (!form.department || !form.clubNames || !form.subject)) {
      setError("Please select your department, subject, and at least one club.");
      setLoading(false); return;
    }
    if ((role === "SDW_COORDINATOR" || role === "HOD") && !form.subject) {
      setError("Please fill subject and specialization.");
      setLoading(false); return;
    }

    try {
      await api.post("/auth/signup", { ...form, role });
      navigate("/login", { state: { message: "Account created! Please sign in." } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || "Signup failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background:"linear-gradient(135deg,#f0f2f8 0%,#e8e4f8 100%)" }}>

      <div className="w-full max-w-lg">
        {/* Brand bar */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-800 tracking-tight"
            style={{ fontFamily:"'Outfit',sans-serif" }}>EventPulse</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Progress header */}
          <div className="px-7 pt-7 pb-2">
            <StepDots total={totalSteps} current={step} />
            <p className="text-xs text-slate-400 text-center mb-4">
              Step {step + 1} of {totalSteps}
            </p>
          </div>

          {/* Step content */}
          <div className="px-7 pb-7">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200
                rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {step === 0 && <StepRole />}
           {step === 1 && <StepCommon form={form} setField={setField} />}
            {step === 2 && <StepRoleFields />}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <button type="button" onClick={() => { setStep(s => s - 1); setError(""); }}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-slate-200
                    bg-white text-slate-600 font-semibold text-sm hover:border-slate-300 transition-all">
                  <ChevronLeft size={16} /> Back
                </button>
              )}

              {step < totalSteps - 1 ? (
                <button type="button"
                  disabled={!canProceed()}
                  onClick={() => { if (canProceed()) { setStep(s => s + 1); setError(""); } }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl
                    font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" disabled={loading} onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating…</>
                    : <><Check size={16} /> Create Account</>}
                </button>
              )}
            </div>

            <p className="text-center text-sm text-slate-400 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}