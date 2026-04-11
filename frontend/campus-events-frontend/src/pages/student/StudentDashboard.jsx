import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import EventCard from "../../components/EventCard";
import StatCard from "../../components/StatCard";
import PageHeader from "../../components/PageHeader";
import { Calendar, CheckCircle, Clock } from "lucide-react";

export default function StudentDashboard({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [events,          setEvents]          = useState([]);
  const [registeredIds,   setRegisteredIds]   = useState([]);
  const [registrations,   setRegistrations]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [registering,     setRegistering]     = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, regRes] = await Promise.all([
        api.get("/events/approved"),
        api.get(`/registrations/student/${user.id}`)
      ]);
      setEvents(eventsRes.data);
      setRegistrations(regRes.data);
      setRegisteredIds(regRes.data.map((r) => r.event.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (eventId) => {
    if (registeredIds.includes(eventId)) return;
    setRegistering(eventId);
    try {
      await api.post("/registrations/register", null, {
        params: { studentId: user.id, eventId }
      });
      setRegisteredIds((prev) => [...prev, eventId]);
    } catch {
      alert("Registration failed. You may already be registered.");
    } finally {
      setRegistering(null);
    }
  };

  // Upcoming = registered + event in future
  const upcomingCount = registrations.filter((r) =>
    r.event?.eventDate && new Date(r.event.eventDate) > new Date()
  ).length;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader
        title={`Hello, ${user.name} 👋`}
        subtitle="Explore and register for campus events"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Events Available"  value={events.length}         icon={Calendar}     color="blue" />
        <StatCard label="Registered"        value={registeredIds.length}  icon={CheckCircle}  color="emerald" />
        <StatCard label="Upcoming"          value={upcomingCount}         icon={Clock}        color="amber" />
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="text-center text-slate-400 mt-20 text-sm">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-400 mt-20 text-sm">
          No approved events right now. Check back later!
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Available Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((event) => {
              const isReg = registeredIds.includes(event.id);
              return (
                <EventCard key={event.id} event={event}>
                  {isReg ? (
                    <span className="badge badge-green w-full text-center py-1.5 block">
                      ✓ Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => register(event.id)}
                      disabled={registering === event.id}
                      className="btn w-full">
                      {registering === event.id ? "Registering…" : "Register"}
                    </button>
                  )}
                </EventCard>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}