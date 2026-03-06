import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";


export default function StudentDashboard({ onLogout }) {

  return (

    <DashboardLayout onLogout={onLogout}>

      <div className="grid grid-cols-3 gap-6">

  <div className="glass-card p-6">

  <p className="text-sm text-gray-500">
    Upcoming Events
  </p>

  <h2 className="text-2xl font-bold mt-2">
    12
  </h2>

</div>

  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500 text-sm">Registered Events</p>
    <h3 className="text-2xl font-bold mt-2">5</h3>
  </div>

  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500 text-sm">Attendance</p>
    <h3 className="text-2xl font-bold mt-2">92%</h3>
  </div>

</div>

<div className="glass-card p-6 hover:shadow-lg transition">

  <h3 className="font-semibold text-lg">
    AI Workshop
  </h3>

  <p className="text-gray-500 text-sm mt-2">
    Seminar Hall A
  </p>

  <p className="text-gray-400 text-sm">
    Feb 25
  </p>

  <button className="btn mt-4">
    Register
  </button>

</div>

    </DashboardLayout>
  );
}