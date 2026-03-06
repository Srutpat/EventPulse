export default function Sidebar() {

  return (
    <div className="w-[260px] bg-gradient-to-br from-emerald-100/70 to-emerald-200/40 backdrop-blur-md border-r border-emerald-200/40 p-6 shadow-lg">

  <h1 className="text-xl font-semibold mb-8 text-emerald-900 ">
    Campus Events
  </h1>

<hr class="border-black my-4" />
      <nav className="space-y-3">

        <div className="p-3 rounded-lg hover:bg-[#fcfcfc]  cursor-pointer">
          Dashboard
        </div>

        <div className="p-3 rounded-lg hover:bg-[#fcfcfc] cursor-pointer">
          Events
        </div>

        <div className="p-3 rounded-lg hover:bg-[#fcfcfc]  cursor-pointer">
          Registrations
        </div>

      </nav>

    </div>
  );
}