import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Mail, Lock, Zap, ArrowRight, Calendar, MapPin } from "lucide-react";
import { safeArray, getStatus } from "../utils";

const ROLE_HOME = {
  STUDENT:"/student", ORGANIZER:"/organizer",
  FACULTY_ADVISOR:"/faculty", SDW_COORDINATOR:"/sdw", HOD:"/hod",
};

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [events,   setEvents]   = useState([]);

  const navigate = useNavigate();

  // 🔥 FETCH LIVE EVENTS (Home Page logic)
  useEffect(() => {
    api.get("/events")
      .then(res => {
        const all = safeArray(res.data);

        const live = all.filter(e =>
          getStatus(e) === "APPROVED" &&
          (!e.registrationDeadline || new Date(e.registrationDeadline) > new Date())
        );

        setEvents(live);
      })
      .catch(console.error);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      onLogin(res.data);
      navigate(ROLE_HOME[res.data.role?.toUpperCase().trim()] || "/login");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>

      {/* 🔥 LEFT = HOME PAGE (LIVE EVENTS) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 text-white">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Zap size={22} className="text-white"/>
          </div>
          <span className="font-brand text-2xl">EventPulse</span>
        </div>

        {/* Content */}
        <div>
          <h1 className="text-5xl font-brand leading-tight mb-4">
            Where campus<br/>events come alive
          </h1>

          <p className="text-white/70 text-lg max-w-md mb-6">
            Discover live events happening across campus. Join, explore,
            and be part of something exciting.
          </p>

          {/* 🔥 LIVE EVENTS */}
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-3 text-white/90">
              Live Events 🎉
            </h3>

            {events.length === 0 ? (
              <p className="text-white/60 text-sm">No live events currently</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {events.slice(0, 5).map(ev => (
                  <div key={ev.id}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">

                    <p className="font-semibold text-white text-sm">
                      {ev.title}
                    </p>

                    <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                      <MapPin size={12}/> {ev.location || "No location"}
                    </p>

                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <Calendar size={12}/> {new Date(ev.startDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-white/40 text-sm">
          © 2025 EventPulse · All rights reserved
        </p>
      </div>

      {/* RIGHT — LOGIN (UNCHANGED) */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center p-8 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{background:"linear-gradient(135deg,#667eea,#764ba2)"}}>
              <Zap size={16} className="text-white"/>
            </div>
            <span className="font-brand text-xl text-slate-800">EventPulse</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome back
          </h2>

          <p className="text-slate-500 text-sm mb-8">
            Sign in to your EventPulse account
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200
              rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-400">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="field-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400"/>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  required className="input pl-10"/>
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400"/>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  required className="input pl-10"/>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn w-full py-3 mt-2 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={16}/>
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account?{" "}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
              Create one here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}