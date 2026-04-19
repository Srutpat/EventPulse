export default function StatCard({ label, value, icon: Icon, color = "indigo", sub }) {
  const colors = {
    indigo:  "from-indigo-500  to-violet-500  shadow-indigo-200",
    emerald: "from-emerald-500 to-teal-500    shadow-emerald-200",
    amber:   "from-amber-500   to-orange-500  shadow-amber-200",
    red:     "from-red-500     to-rose-500    shadow-red-200",
    blue:    "from-blue-500    to-cyan-500    shadow-blue-200",
    violet:  "from-violet-500  to-purple-600  shadow-violet-200",
  };
  const [gradFrom, gradTo, shadow] = (colors[color] || colors.indigo).split(" ");

  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradFrom} ${gradTo}
            flex items-center justify-center shadow-lg ${shadow}
            group-hover:scale-110 transition-transform duration-200`}>
            <Icon size={18} className="text-white"/>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 tracking-tight">{value ?? "—"}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}