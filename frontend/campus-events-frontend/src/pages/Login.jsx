import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Mail, Lock, Zap } from "lucide-react";

const ROLE_HOME = {
  STUDENT:"/student", ORGANIZER:"/organizer",
  FACULTY_ADVISOR:"/faculty", SDW_COORDINATOR:"/sdw", HOD:"/hod",
};

export default function Login({ onLogin }) {
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login",{email,password});
      onLogin(res.data);
      navigate(ROLE_HOME[res.data.role?.toUpperCase().trim()] || "/login");
    } catch { setError("Invalid email or password."); }
    finally  { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow">
            <Zap size={18} className="text-white"/>
          </div>
          <span className="text-xl font-bold text-slate-800" style={{fontFamily:"'Syne',sans-serif"}}>CampusEvents</span>
        </div>
        <form onSubmit={handleLogin} className="glass-card p-8 flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3 text-slate-400"/>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="input pl-10"/>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3 text-slate-400"/>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required className="input pl-10"/>
          </div>
          <button type="submit" disabled={loading} className="btn w-full py-2.5">{loading?"Signing in…":"Sign In"}</button>
          <p className="text-center text-sm text-slate-500">No account?{" "}<Link to="/signup" className="text-emerald-600 font-medium hover:underline">Register</Link></p>
        </form>
        <div className="mt-4 glass-card p-4 text-xs text-slate-500 space-y-0.5">
          <p className="font-semibold text-slate-600 mb-1">Test credentials (password: 1234)</p>
          <p>👤 student@test.com &nbsp;&nbsp; 🎯 organizer@test.com</p>
          <p>🏫 faculty@test.com &nbsp;&nbsp; 📋 sdw@test.com &nbsp;&nbsp; 👑 hod@test.com</p>
        </div>
      </div>
    </div>
  );
}