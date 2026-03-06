import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

export default function App() {

  const [user, setUser] = useState(null);

  // Restore user after refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Protected Route
  const ProtectedRoute = ({ role, children }) => {

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>

      <Routes>

        {/* Default route */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to={`/${user.role.toLowerCase()}`} />
              : <Navigate to="/login" />
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={`/${user.role.toLowerCase()}`} />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard
                user={user}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Organizer */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute role="ORGANIZER">
              <OrganizerDashboard
                user={user}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Faculty */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute role="FACULTY">
              <FacultyDashboard
                user={user}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}