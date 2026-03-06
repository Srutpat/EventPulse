import DashboardLayout from "../layouts/DashboardLayout";

export default function OrganizerDashboard({onLogout}) {

  return (

    <DashboardLayout onLogout={onLogout}>

      <h2 className="text-2xl font-semibold mb-6">
        Organizer Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="glass-card p-6 hover:-translate-y-1 transition">
          <p className="text-gray-500 text-sm">
            Events Created
          </p>
          <h3 className="text-2xl font-bold mt-2">
            8
          </h3>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition">
          <p className="text-gray-500 text-sm">
            Pending Approvals
          </p>
          <h3 className="text-2xl font-bold mt-2">
            2
          </h3>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition">
          <p className="text-gray-500 text-sm">
            Total Participants
          </p>
          <h3 className="text-2xl font-bold mt-2">
            156
          </h3>
        </div>

      </div>

      {/* Create Event */}
      <div className="glass-card p-6 mb-6 flex justify-between items-center">

        <div>
          <h3 className="text-lg font-semibold">
            Create New Event
          </h3>
          <p className="text-gray-500 text-sm">
            Add a new event for students
          </p>
        </div>

        <button className="btn">
          + Create Event
        </button>

      </div>

      {/* Events Table */}
      <div className="glass-card p-6">

        <h3 className="font-semibold mb-4">
          Your Events
        </h3>

        <div className="space-y-3">

          <div className="p-4 border rounded-lg flex justify-between hover:bg-emerald-50 transition">

            <span>AI Workshop</span>
            <span className="text-sm text-gray-500">Pending</span>

          </div>

          <div className="p-4 border rounded-lg flex justify-between hover:bg-emerald-50 transition">

            <span>Hackathon</span>
            <span className="text-sm text-green-600">Approved</span>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}