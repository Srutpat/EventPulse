export default function EventCard({ title, location, date }) {

  return (
    <div className="bg-white border border-slate-200
    rounded-xl p-6 shadow-sm hover:shadow-md transition">

      <h3 className="font-semibold text-slate-800 text-lg">
        {title}
      </h3>

      <p className="text-slate-500 text-sm mt-2">
        {location}
      </p>

      <p className="text-slate-400 text-sm">
        {date}
      </p>

      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700
        text-white px-4 py-2 rounded-lg">
        Register
      </button>

    </div>
  );
}