import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login  from "./pages/Login";
import Signup from "./pages/Signup";

// Student
import StudentDashboard     from "./pages/student/StudentDashboard";
import StudentEvents        from "./pages/student/StudentEvents";
import StudentRegistrations from "./pages/student/StudentRegistrations";

// Organizer
import OrganizerDashboard    from "./pages/organizer/OrganizerDashboard";
import CreateEvent           from "./pages/organizer/CreateEvent";
import OrganizerParticipants from "./pages/OrganizerParticipants";
import SubmitBudget          from "./pages/organizer/SubmitBudget";
import PostEventReport       from "./pages/organizer/PostEventReport";

// Faculty Advisor
import FacultyDashboard  from "./pages/faculty/FacultyDashboard";
import FacultyApprovals  from "./pages/faculty/FacultyApprovals";
import FacultyReports    from "./pages/faculty/FacultyReports";

// SDW Coordinator
import SDWDashboard  from "./pages/sdw/SDWDashboard";
import SDWApprovals  from "./pages/sdw/SDWApprovals";

// HoD
import HoDDashboard  from "./pages/hod/HoDDashboard";
import HoDApprovals  from "./pages/hod/HoDApprovals";

// ── Protected Route ──────────────────────────────────────────────────────────
function Guard({ user, roles, children }) {
  if (!user) return <Navigate to="/login" replace />;
  const userRole = user.role?.toUpperCase().trim();
  if (!roles.includes(userRole)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });

  const login  = (u) => { localStorage.setItem("user", JSON.stringify(u)); setUser(u); };
  const logout = ()  => { localStorage.removeItem("user"); setUser(null); };

  const S  = ["STUDENT"];
  const O  = ["ORGANIZER"];
  const FA = ["FACULTY_ADVISOR"];
  const SW = ["SDW_COORDINATOR"];
  const H  = ["HOD"];

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"  element={<Login  onLogin={login} />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Student ── */}
        <Route path="/student"               element={<Guard user={user} roles={S}><StudentDashboard     onLogout={logout}/></Guard>}/>
        <Route path="/student/events"        element={<Guard user={user} roles={S}><StudentEvents        onLogout={logout}/></Guard>}/>
        <Route path="/student/registrations" element={<Guard user={user} roles={S}><StudentRegistrations onLogout={logout}/></Guard>}/>

        {/* ── Organizer ── */}
        <Route path="/organizer"               element={<Guard user={user} roles={O}><OrganizerDashboard    onLogout={logout}/></Guard>}/>
        <Route path="/organizer/create"        element={<Guard user={user} roles={O}><CreateEvent           onLogout={logout}/></Guard>}/>
        <Route path="/organizer/edit/:id"      element={<Guard user={user} roles={O}><CreateEvent           onLogout={logout}/></Guard>}/>
        <Route path="/organizer/participants"  element={<Guard user={user} roles={O}><OrganizerParticipants onLogout={logout}/></Guard>}/>
        <Route path="/organizer/budget/:id"    element={<Guard user={user} roles={O}><SubmitBudget          onLogout={logout}/></Guard>}/>
        <Route path="/organizer/report/:id"    element={<Guard user={user} roles={O}><PostEventReport       onLogout={logout}/></Guard>}/>

        {/* ── Faculty Advisor ── */}
        <Route path="/faculty"          element={<Guard user={user} roles={FA}><FacultyDashboard onLogout={logout}/></Guard>}/>
        <Route path="/faculty/approvals"element={<Guard user={user} roles={FA}><FacultyApprovals onLogout={logout}/></Guard>}/>
        <Route path="/faculty/reports"  element={<Guard user={user} roles={FA}><FacultyReports   onLogout={logout}/></Guard>}/>

        {/* ── SDW Coordinator ── */}
        <Route path="/sdw"          element={<Guard user={user} roles={SW}><SDWDashboard onLogout={logout}/></Guard>}/>
        <Route path="/sdw/approvals"element={<Guard user={user} roles={SW}><SDWApprovals onLogout={logout}/></Guard>}/>

        {/* ── HoD ── */}
        <Route path="/hod"          element={<Guard user={user} roles={H}><HoDDashboard onLogout={logout}/></Guard>}/>
        <Route path="/hod/approvals"element={<Guard user={user} roles={H}><HoDApprovals onLogout={logout}/></Guard>}/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />}/>
      </Routes>
    </BrowserRouter>
  );
}