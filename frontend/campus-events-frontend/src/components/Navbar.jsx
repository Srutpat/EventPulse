import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");   // remove saved login
    if (onLogout) onLogout();          // update state in App.jsx
    navigate("/login");                // redirect to login page
  };

  return (
    <div className="bg-slate-300 backdrop-blur-md border-b border-white/40 px-8 py-4 flex justify-between items-center">

      <h2 className="text-xl font-semibold font-serif">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <input
          placeholder="Search events..."
          className="border rounded-lg px-4 py-2 w-[250px]"
        />

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          Logout
        </button>

      </div>

    </div>
  );
}