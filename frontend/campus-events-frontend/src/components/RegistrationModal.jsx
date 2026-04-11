import { useState } from "react";
import api from "../api/axios";

export default function RegistrationModal({ event, user, onClose }) {

  const [form, setForm] = useState({
    name: user.name,
    prn: user.prn,
    department: user.department,
    mobile: "",
    email: user.email
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    try {

      await api.post("/registrations/register", {
        userId: user.id,
        eventId: event.id,
        ...form
      });

      alert("Registered successfully!");
      onClose();

    } catch (err) {
      alert("Already registered or error");
    }
  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-6 w-[400px]">

        <h2 className="text-xl font-semibold mb-4">
          Register for {event.title}
        </h2>

        <input name="name" value={form.name} disabled className="input mb-2"/>
        <input name="prn" value={form.prn} disabled className="input mb-2"/>
        <input name="department" value={form.department} disabled className="input mb-2"/>

        <input
          name="mobile"
          placeholder="Mobile Number"
          onChange={handleChange}
          className="input mb-2"
        />

        <input name="email" value={form.email} disabled className="input mb-3"/>

        <button
          onClick={handleSubmit}
          className="btn w-full">
          Confirm Registration
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-500 w-full">
          Cancel
        </button>

      </div>

    </div>
  );
}