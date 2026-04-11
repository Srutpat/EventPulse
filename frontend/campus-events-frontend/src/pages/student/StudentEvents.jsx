import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function StudentEvents() {

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    api.get("/events/approved")
      .then(res => setEvents(res.data));
  }, []);

  return (

    <div>

      <h2 className="text-2xl font-semibold mb-6">
        Upcoming Events
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {events.map(event => (

          <div key={event.id}
            className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow hover:shadow-lg transition">

            <h3 className="text-lg font-semibold">{event.title}</h3>

            <p className="text-sm text-gray-500 mt-1">
              {event.clubName || "Tech Club"}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              {event.description}
            </p>

            <p className="text-sm mt-2">📅 {event.eventDate}</p>

            <button
              onClick={() => setSelectedEvent(event)}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg">
              Register
            </button>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
        />
      )}

    </div>
  );
}