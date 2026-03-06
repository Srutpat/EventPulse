import Navbar from "./Navbar";

export default function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
