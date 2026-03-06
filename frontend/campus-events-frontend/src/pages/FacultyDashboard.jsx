import DashboardLayout from "../layouts/DashboardLayout";

export default function FacultyDashboard({onLogout}) {

  return (

    <DashboardLayout onLogout={onLogout}>

      <h2 className="text-2xl font-semibold mb-6">
        Faculty Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="glass-card p-6 hover:-translate-y-1 transition">
          <p className="text-gray-500 text-sm">
            Events To Review
          </p>
          <h3 className="text-2xl font-bold mt-2">
            4
          </h3>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition">
          <p className="text-gray-500 text-sm">
            Approved Events
          </p>
          <h3 className="text-2xl font-bold mt-2">
            21
          </h3>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 transition">
          <p className="text-gray-500 text-sm">
            Attendance Reports
          </p>
          <h3 className="text-2xl font-bold mt-2">
            12
          </h3>
        </div>

      </div>

      {/* Approval Section */}

      <div className="glass-card p-6 mb-6">

        <h3 className="font-semibold mb-4">
          Events Awaiting Approval
        </h3>

        <div className="space-y-3">

          <div className="p-4 border rounded-lg flex justify-between items-center hover:bg-emerald-50 transition">

            <span>Cyber Security Seminar</span>

            <div className="flex gap-2">

              <button className="btn">
                Approve
              </button>

              <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                Reject
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Reports */}

      <div className="glass-card p-6">

        <h3 className="font-semibold mb-4">
          Event Reports
        </h3>

        <div className="space-y-3">

          <div className="p-4 border rounded-lg flex justify-between hover:bg-emerald-50 transition">

            <span>AI Workshop Report</span>
            <button className="btn">Download</button>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}