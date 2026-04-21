import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  CheckCircle, BarChart3, LogOut, PlusCircle, Zap,
  IndianRupee, ShieldCheck, TrendingUp, X
} from "lucide-react";

const MENUS = {
  STUDENT: [
    { name: "Dashboard",        path: "/student",               icon: LayoutDashboard },
    { name: "Browse Events",    path: "/student/events",        icon: Calendar        },
    { name: "My Registrations", path: "/student/registrations", icon: ClipboardList   },
  ],
  ORGANIZER: [
    { name: "Dashboard",    path: "/organizer",              icon: LayoutDashboard },
    { name: "Create Event", path: "/organizer/create",       icon: PlusCircle      },
    { name: "Participants", path: "/organizer/participants",  icon: Users           },
    { name: "Analytics",   path: "/analytics",              icon: TrendingUp      },
  ],
  FACULTY_ADVISOR: [
    { name: "Dashboard",          path: "/faculty",          icon: LayoutDashboard },
    { name: "Event Approvals",    path: "/faculty/approvals",icon: CheckCircle     },
    { name: "Attendance Reports", path: "/faculty/reports",  icon: BarChart3       },
    { name: "Analytics",          path: "/analytics",        icon: TrendingUp      },
  ],
  SDW_COORDINATOR: [
    { name: "Dashboard",      path: "/sdw",           icon: LayoutDashboard },
    { name: "Review & Budget",path: "/sdw/approvals", icon: IndianRupee     },
    { name: "Analytics",      path: "/analytics",     icon: TrendingUp      },
  ],
  HOD: [
    { name: "Dashboard",      path: "/hod",           icon: LayoutDashboard },
    { name: "Final Approvals",path: "/hod/approvals", icon: ShieldCheck     },
    { name: "Analytics",      path: "/analytics",     icon: TrendingUp      },
  ],
};

const ROLE_CONFIG = {
  STUDENT:         { label: "Student",         grad: "from-indigo-600 to-violet-600"  },
  ORGANIZER:       { label: "Organizer",       grad: "from-emerald-600 to-teal-500"   },
  FACULTY_ADVISOR: { label: "Faculty Advisor", grad: "from-violet-600 to-purple-700"  },
  SDW_COORDINATOR: { label: "SDW Coordinator", grad: "from-amber-500 to-orange-500"   },
  HOD:             { label: "Head of Dept.",   grad: "from-rose-600 to-pink-600"      },
};

export default function Sidebar({ role, onLogout, onNavigate }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const menu      = MENUS[role] || [];
  const cfg       = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT;
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  const handleNav = (path) => {
    navigate(path);
    onNavigate?.(); // close drawer on mobile
  };

  return (
    <div className="w-[260px] shrink-0 h-screen flex flex-col bg-white border-r border-slate-100 shadow-sm overflow-hidden">

      {/* Branded header */}
      <div className={`p-5 bg-gradient-to-br ${cfg.grad} shrink-0`}>

        {/* Close button — mobile only */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span
              className="text-white text-lg font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              EventPulse
            </span>
          </div>
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="lg:hidden p-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              aria-label="Close menu"
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>

        <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
          <p className="text-white font-semibold text-sm truncate">{user.name || "User"}</p>
          <p className="text-white/70 text-xs truncate">{user.email || ""}</p>
          <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5
            rounded-md bg-white/20 text-white uppercase tracking-wide">
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-1">
          Menu
        </p>
        <div className="space-y-0.5">
          {menu.map((item, i) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path) && item.path.length > 1);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? `bg-gradient-to-r ${cfg.grad} text-white shadow-md`
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon size={17} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}