import { Calendar, MapPin, Building2, Tag, IndianRupee, Clock } from "lucide-react";

const STATUS_BADGE = {
  APPROVED:         "badge badge-green",
  PENDING_APPROVAL: "badge badge-yellow",
  DRAFT:            "badge badge-gray",
  REJECTED:         "badge badge-red",
};

export function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export function formatDateShort(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

export function isMultiDay(startDate, endDate) {
  if (!startDate || !endDate) return false;
  const s = new Date(startDate).toDateString();
  const e = new Date(endDate).toDateString();
  return s !== e;
}

export default function EventCard({ event, children }) {
  const multiDay = isMultiDay(event.startDate, event.endDate);

  return (
    <div className="glass-card p-5 flex flex-col gap-3
      hover:-translate-y-1 hover:shadow-md transition-all duration-200">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 leading-snug">{event.title}</h3>
        {event.status && (
          <span className={STATUS_BADGE[event.status] || "badge badge-gray"}>
            {event.status.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Club tag */}
      {event.clubName && (
        <span className="badge badge-violet self-start">{event.clubName}</span>
      )}

      {/* Description */}
      {event.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      )}

      {/* Meta */}
      <div className="text-xs text-slate-500 space-y-1.5">

        {/* Date — multi-day or single */}
        {multiDay ? (
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>
              {formatDateShort(event.startDate)} → {formatDateShort(event.endDate)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>{formatDate(event.startDate || event.eventDate)}</span>
          </div>
        )}

        {/* Registration deadline */}
        {event.registrationDeadline && (
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span>Deadline: {formatDate(event.registrationDeadline)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-slate-400 shrink-0" />
          <span>{event.location}</span>
        </div>

        {event.department && (
          <div className="flex items-center gap-1.5">
            <Building2 size={13} className="text-slate-400 shrink-0" />
            <span>{event.department}</span>
          </div>
        )}

        {event.category && (
          <div className="flex items-center gap-1.5">
            <Tag size={13} className="text-slate-400 shrink-0" />
            <span>{event.category}</span>
          </div>
        )}

        {/* Budget */}
        {(event.totalBudget || event.estimatedBudget) && (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <IndianRupee size={13} className="shrink-0" />
            <span>
              Budget: ₹{(event.totalBudget || event.estimatedBudget).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}