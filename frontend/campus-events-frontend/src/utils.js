export function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

export function getStatus(event) {
  if (!event?.status) return "";
  if (typeof event.status === "string") return event.status.toUpperCase();
  if (typeof event.status === "object" && event.status.name) return event.status.name.toUpperCase();
  return String(event.status).toUpperCase();
}

export function deadlinePassed(event) {
  if (!event?.registrationDeadline) return false;
  return new Date() > new Date(event.registrationDeadline);
}

export function eventHasEnded(event) {
  const dt = event?.endDate || event?.startDate || event?.eventDate;
  if (!dt) return false;
  return new Date(dt) < new Date();
}

export function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatDateOnly(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/** Central/college-level event: NSS, cultural committee, etc (no department) */
export function isCentralEvent(event) {
  return event?.isCentralEvent === "true" ||
    !event?.department ||
    event?.department?.trim() === "";
}

/**
 * VISIBILITY RULES during approval process:
 *
 * Faculty Advisor with dept X:
 *   → Sees events FROM dept X (their approval responsibility)
 *   → Also sees central events (so they can forward to SDW Dean)
 *   → Does NOT see events from other depts
 *
 * SDW Coordinator with dept X:
 *   → Sees ONLY dept X events, NEVER central events (those go to SDW Dean)
 *
 * SDW Dean (no dept set):
 *   → Sees ALL events including central/NSS ones
 *
 * HoD with dept X:
 *   → Sees only dept X events
 *   → Central events don't go through HoD
 */
export function filterForFacultyApproval(events, userDept) {
  if (!userDept) return events;
  return events.filter(e =>
    e.department === userDept || isCentralEvent(e)
  );
}

export function filterForSDW(events, userDept) {
  if (!userDept) return events; // SDW Dean sees all
  return events.filter(e =>
    e.department === userDept && !isCentralEvent(e)
  );
}

export function filterForHoD(events, userDept) {
  if (!userDept) return events;
  return events.filter(e => e.department === userDept);
}


export function isUnderScrutiny(event) {
  const s = getStatus(event);
  return ["PENDING_FACULTY", "PENDING_SDW", "PENDING_HOD"].includes(s);
}

export function isFinalApproved(event) {
  return getStatus(event) === "APPROVED";
}

export function isRejected(event) {
  const s = getStatus(event);
  return s.includes("REJECTED");
}