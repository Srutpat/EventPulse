import api from "../api/axios";
import { useEffect, useState } from "react";

export default function Participants({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // 👈 logged-in user

  useEffect(() => {
    api.get(`/registrations/event/${eventId}`)
      .then(res => setParticipants(res.data));
  }, [eventId]);

  const markAttended = async (regId) => {
    await api.put(`/registrations/${regId}/attended`);
    const res = await api.get(`/registrations/event/${eventId}`);
    setParticipants(res.data);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Participants</h3>

      <div className="space-y-2">
        {participants.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-800 p-2">
            <span className="text-sm text-slate-300">
              {p.user.name} ({p.user.department})
            </span>

            {/* 3️⃣ Only ORGANIZER can mark attendance */}
            {user?.role === "ORGANIZER" && p.status !== "ATTENDED" && (
              <button
                onClick={() => markAttended(p.id)}
                className="text-xs rounded-md border border-emerald-500 px-2 py-1 text-emerald-400 hover:bg-emerald-500/10"
              >
                Mark Attended
              </button>
            )}

            {p.status === "ATTENDED" && (
              <span className="text-green-400 text-xs">Attended</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
