import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Zap, GraduationCap, BookOpen, User, ShieldCheck, Crown } from "lucide-react";
import { DEPARTMENTS, FACULTY_DEPARTMENTS, DIVISIONS, YEARS, CLUBS } from "../constants";

const ROLES = [
  { value:"STUDENT",         label:"Student",         icon:GraduationCap, desc:"Register for events"       },
  { value:"ORGANIZER",       label:"Organizer",       icon:BookOpen,       desc:"Create & manage events"   },
  { value:"FACULTY_ADVISOR", label:"Faculty Advisor", icon:User,           desc:"Review & approve events"  },
  { value:"SDW_COORDINATOR", label:"SDW Coordinator", icon:ShieldCheck,    desc:"Budget & event oversight" },
  { value:"HOD",             label:"Head of Dept.",   icon:Crown,          desc:"Final approvals"          },
];

const INITIAL = {
  name:"", email:"", password:"", confirmPassword:"",
  prn:"", department:"", year:"", division:"", clubName:"", role:""
};

export default function Signup() {
  const [form,    setForm]    = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const selectRole = role => setForm(f => ({
    ...f, role,
    prn:"", year:"", division:"", clubName:""
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role)                              { setError("Please select a role."); return; }
    if (form.password !== form.confirmPassword)  { setError("Passwords do not match."); return; }
    if (form.password.length < 6)                { setError("Password must be at least 6 characters."); return; }

    setLoading(true); setError("");

    const payload = {
      name:       form.name,
      email:      form.email,
      password:   form.password,
      role:       form.role,
      department: form.department,
      // Student-only fields
      prn:      form.role === "STUDENT" ? form.prn      : null,
      year:     form.role === "STUDENT" ? form.year     : null,
      division: form.role === "STUDENT" ? form.division : null,
    };

    try {
      await api.post("/auth/signup", payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  const isStudent   = form.role === "STUDENT";
  const isOrganizer = form.role === "ORGANIZER";
  const isFaculty   = form.role === "FACULTY_ADVISOR";
  const isSDWorHoD  = form.role === "SDW_COORDINATOR" || form.role === "HOD";

  // Department list depends on role
  const deptList = (isFaculty || isSDWorHoD) ? FACULTY_DEPARTMENTS : DEPARTMENTS;

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-100 px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow">
            <Zap size={18} className="text-white"/>
          </div>
          <span className="text-xl font-bold text-slate-800" style={{fontFamily:"'Syne',sans-serif"}}>
            CampusEvents
          </span>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
            <p className="text-sm text-slate-500 mt-1">Select your role to get started</p>
          </div>

          {/* Role selector */}
          <div>
            <label className="field-label">I am a… <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {ROLES.map(({ value, label, icon:Icon, desc }) => (
                <button type="button" key={value} onClick={() => selectRole(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2
                    text-center transition-all duration-150
                    ${form.role === value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                  <Icon size={18}/>
                  <span className="text-xs font-semibold leading-tight">{label}</span>
                  <span className="text-[9px] leading-tight text-center opacity-60 hidden sm:block">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {/* ── Common fields (all roles) ── */}
          {form.role && (
            <>
              <div>
                <label className="field-label">Full Name <span className="text-red-500">*</span></label>
                <input name="name" placeholder="e.g. Rahul Sharma"
                  onChange={set} required className="input"/>
              </div>

              <div>
                <label className="field-label">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" placeholder="you@college.edu"
                  onChange={set} required className="input"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Password <span className="text-red-500">*</span></label>
                  <input name="password" type="password" placeholder="Min 6 chars"
                    onChange={set} required className="input"/>
                </div>
                <div>
                  <label className="field-label">Confirm Password <span className="text-red-500">*</span></label>
                  <input name="confirmPassword" type="password" placeholder="Repeat"
                    onChange={set} required className="input"/>
                </div>
              </div>

              <div>
                <label className="field-label">Department</label>
                <select name="department" onChange={set} value={form.department} className="input">
                  <option value="">Select department</option>
                  {deptList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          )}

          {/* ── STUDENT-only fields ── */}
          {isStudent && (
            <>
              <div>
                <label className="field-label">PRN Number</label>
                <input name="prn" placeholder="e.g. 12210XXXXX"
                  onChange={set} className="input"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Year</label>
                  <select name="year" onChange={set} value={form.year} className="input">
                    <option value="">Select year</option>
                    {YEARS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Division</label>
                  <select name="division" onChange={set} value={form.division} className="input">
                    <option value="">Select division</option>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── ORGANIZER-only field ── */}
          {isOrganizer && (
            <div>
              <label className="field-label">Associated Club</label>
              <select name="clubName" onChange={set} value={form.clubName} className="input">
                <option value="">Select club (optional)</option>
                {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* SDW / HoD: just name + email + password + department — no extra fields needed */}
          {isSDWorHoD && (
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100
              rounded-xl px-4 py-3">
              ℹ️ {form.role === "HOD" ? "Head of Department" : "SDW Coordinator"} accounts only need
              basic information. Your role will give you access to the relevant dashboards.
            </div>
          )}

          <button type="submit" disabled={loading || !form.role}
            className="btn w-full py-2.5 mt-1">
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}