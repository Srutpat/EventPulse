import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  CheckCircle, BarChart3, LogOut, PlusCircle, Zap,
  IndianRupee, FileText, ShieldCheck, Eye
} from "lucide-react";

const MENUS = {
  STUDENT: [
    { name:"Dashboard",        path:"/student",               icon:LayoutDashboard },
    { name:"Browse Events",    path:"/student/events",        icon:Calendar        },
    { name:"My Registrations", path:"/student/registrations", icon:ClipboardList   },
  ],
  ORGANIZER: [
    { name:"Dashboard",        path:"/organizer",              icon:LayoutDashboard },
    { name:"Create Event",     path:"/organizer/create",       icon:PlusCircle      },
    { name:"Participants",     path:"/organizer/participants",  icon:Users           },
  ],
  FACULTY_ADVISOR: [
    { name:"Dashboard",        path:"/faculty",                icon:LayoutDashboard },
    { name:"Event Approvals",  path:"/faculty/approvals",      icon:CheckCircle     },
    { name:"Attendance Reports",path:"/faculty/reports",       icon:BarChart3       },
  ],
  SDW_COORDINATOR: [
    { name:"Dashboard",        path:"/sdw",                    icon:LayoutDashboard },
    { name:"Event & Budget",   path:"/sdw/approvals",          icon:IndianRupee     },
  ],
  HOD: [
    { name:"Dashboard",        path:"/hod",                    icon:LayoutDashboard },
    { name:"Final Approvals",  path:"/hod/approvals",          icon:ShieldCheck     },
  ],
};

const THEME = {
  STUDENT:         { grad:"from-sky-50 to-blue-100",     border:"border-blue-200/40",   accent:"bg-blue-600",    chip:"badge-blue"   },
  ORGANIZER:       { grad:"from-emerald-50 to-teal-100", border:"border-emerald-200/40",accent:"bg-emerald-600", chip:"badge-green"  },
  FACULTY_ADVISOR: { grad:"from-violet-50 to-purple-100",border:"border-violet-200/40", accent:"bg-violet-600",  chip:"badge-violet" },
  SDW_COORDINATOR: { grad:"from-amber-50 to-orange-100", border:"border-amber-200/40",  accent:"bg-amber-600",   chip:"badge-yellow" },
  HOD:             { grad:"from-rose-50 to-pink-100",    border:"border-rose-200/40",   accent:"bg-rose-600",    chip:"badge-red"    },
};

const ROLE_LABELS = {
  STUDENT:"Student", ORGANIZER:"Organizer",
  FACULTY_ADVISOR:"Faculty Advisor",
  SDW_COORDINATOR:"SDW Coordinator",
  HOD:"Head of Dept.",
};

export default function Sidebar({ role, onLogout }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const menu      = MENUS[role]  || [];
  const theme     = THEME[role]  || THEME.STUDENT;
  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <div className={`w-[240px] shrink-0 h-screen flex flex-col justify-between
      bg-gradient-to-b ${theme.grad} backdrop-blur-md
      border-r ${theme.border} border-white/50 p-5 shadow-lg`}>

      {/* Brand */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-xl ${theme.accent} flex items-center justify-center shadow`}>
            <Zap size={16} className="text-white"/>
          </div>
          <span className="font-bold text-slate-800 text-[15px] tracking-tight"
                style={{fontFamily:"'Syne', sans-serif"}}>
            CampusEvents
          </span>
        </div>

        {/* Role chip */}
        <div className="mb-5 px-1">
          <span className={`badge text-[10px] uppercase tracking-widest ${theme.chip}`}>
            {roleLabel}
          </span>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"}`}>
                <Icon size={17} className={isActive ? "opacity-100" : "opacity-60"}/>
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User + Logout */}
      <div className="space-y-1">
        <div className="px-3 py-2 rounded-xl bg-white/40 text-xs text-slate-500 truncate">
          {JSON.parse(localStorage.getItem("user") || "{}")?.name || ""}
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium text-red-500 hover:bg-red-50 transition">
          <LogOut size={17}/> Logout
        </button>
      </div>
    </div>
  );
}