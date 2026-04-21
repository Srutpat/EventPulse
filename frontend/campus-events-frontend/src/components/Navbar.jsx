import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, X } from "lucide-react";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="bg-slate-300 backdrop-blur-md border-b border-white/40 px-4 sm:px-8 py-3 sm:py-4
      flex items-center justify-between gap-3">

      {/* Title — hidden when mobile search is open */}
      <h2
        className={`text-lg sm:text-xl font-semibold font-serif shrink-0 transition-all
          ${searchOpen ? "hidden sm:block" : "block"}`}
      >
        Dashboard
      </h2>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">

        {/* Expanded search on desktop, toggleable on mobile */}
        {searchOpen ? (
          <div className="flex items-center gap-2 sm:hidden">
            <input
              autoFocus
              placeholder="Search events..."
              className="border rounded-lg px-3 py-1.5 text-sm w-[180px] focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-400/40 transition"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            className="sm:hidden p-1.5 rounded-lg hover:bg-slate-400/40 transition"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}

        {/* Always-visible search on sm+ */}
        <input
          placeholder="Search events..."
          className="hidden sm:block border rounded-lg px-4 py-2 w-[200px] lg:w-[250px] text-sm
            focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-black text-white px-3 sm:px-4 py-2 rounded-lg
            hover:bg-gray-800 transition text-sm"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}