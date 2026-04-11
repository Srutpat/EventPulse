export default function StatCard({ label, value, icon: Icon, color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue:    "bg-blue-100 text-blue-600",
    amber:   "bg-amber-100 text-amber-600",
    red:     "bg-red-100 text-red-600",
    violet:  "bg-violet-100 text-violet-600",
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value ?? "—"}</p>
    </div>
  );
}