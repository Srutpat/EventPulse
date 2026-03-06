import { useEffect, useState } from "react";
import api from "../api/axios";
import EventModal from "../components/EventModal";
import Layout from "../components/Layout";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/events").then(res => setEvents(res.data));
  }, []);

  return (
    <Layout title="Discover Campus Events">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(ev => (
          <div
            key={ev.id}
            onClick={() => setSelected(ev)}
            className="cursor-pointer rounded-2xl bg-slate-800/60 p-5 border border-white/10 hover:-translate-y-1 transition"
          >
            <h3 className="text-lg font-semibold">{ev.title}</h3>
            <p className="text-slate-400 text-sm line-clamp-2">{ev.description}</p>
            <div className="mt-3 text-sm text-indigo-400">{ev.clubName}</div>
          </div>
        ))}
      </div>

      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </Layout>
  );
}
