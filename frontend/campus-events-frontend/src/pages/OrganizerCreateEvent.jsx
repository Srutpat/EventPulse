import { useState } from "react";
import api from "../api/axios";

export default function OrganizerCreateEvent() {

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    department: "",
    category: "",
    eventDate: "",
    registrationDeadline: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/events/create", form);

      alert("Event submitted for approval 🚀");

      setForm({
        title: "",
        description: "",
        location: "",
        department: "",
        category: "",
        eventDate: "",
        registrationDeadline: ""
      });

    } catch (err) {
      alert("Error creating event");
    }
  };

  return (

    <div className="max-w-3xl mx-auto">

      <h2 className="text-2xl font-semibold mb-6">
        Create New Event
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow space-y-4">

        <input
          name="title"
          placeholder="Event Title"
          value={form.title}
          onChange={handleChange}
          className="input w-full"
        />

        <textarea
          name="description"
          placeholder="Event Description"
          value={form.description}
          onChange={handleChange}
          className="input w-full"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="input w-full"
        />

        <input
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
          className="input w-full"
        />

        <input
          name="category"
          placeholder="Category (Tech/Cultural)"
          value={form.category}
          onChange={handleChange}
          className="input w-full"
        />

        <input
          type="date"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          className="input w-full"
        />

        <input
          type="date"
          name="registrationDeadline"
          value={form.registrationDeadline}
          onChange={handleChange}
          className="input w-full"
        />

        <button className="btn w-full">
          Submit for Approval
        </button>

      </form>

    </div>
  );
}