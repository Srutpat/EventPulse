export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold text-slate-800"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="shrink-0 self-start sm:self-auto">{children}</div>
      )}
    </div>
  );
}