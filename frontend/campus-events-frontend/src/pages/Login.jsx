import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Mail, Lock } from "lucide-react";

export default function Login({ onLogin }) {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    if(loading) return;

    setLoading(true);
    setError("");

    try{

      const res = await api.post("/auth/login",{
        email,
        password
      });

      onLogin(res.data);

      navigate(`/${res.data.role.toLowerCase()}`);

    }catch(err){
      setError("Invalid email or password");
    }
    finally{
      setLoading(false);
    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center
    bg-gradient-to-br from-blue-200 via-sky-100 to-blue-300">

      <form
        onSubmit={handleLogin}
        className="w-[380px] backdrop-blur-xl
        bg-white/70 border border-white/40
        rounded-2xl shadow-xl p-8
        flex flex-col gap-6
        transition duration-300 hover:shadow-2xl">

        <div className="text-center">

          <h1 className="text-2xl font-semibold text-slate-800">
            Sign in with email
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Make a new doc to bring your words,
            data, and teams together.
          </p>

        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="relative">

          <Mail
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2
            border border-slate-200
            rounded-lg
            focus:outline-none
            focus:ring-2 focus:ring-blue-400
            bg-white"
          />

        </div>

        {/* Password */}
        <div className="relative">

          <Lock
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2
            border border-slate-200
            rounded-lg
            focus:outline-none
            focus:ring-2 focus:ring-blue-400
            bg-white"
          />

        </div>

        <div className="flex justify-between text-sm text-slate-500">

          <label className="flex gap-2 items-center">
            <input type="checkbox"/>
            Remember me
          </label>

          <span className="cursor-pointer hover:text-blue-600">
            Forgot password?
          </span>

        </div>

        <button
          className="bg-black text-white py-2 rounded-lg
          hover:opacity-90 transition"
          disabled={loading}>

          {loading ? "Signing in..." : "Get Started"}

        </button>

        {/* social */}
        <div className="text-center text-xs text-slate-400">
          Or sign in with
        </div>

        <div className="flex justify-center gap-6">

          <span className="cursor-pointer">G</span>
          <span className="cursor-pointer">F</span>
          <span className="cursor-pointer"></span>

        </div>

      </form>

    </div>
  );
}