import React, { useState } from 'react';
import { createIncident } from '../services/api';

export default function IncidentForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'Low',
    location: { type: 'Point', coordinates: [20.5937, 78.9629] }, // Default: India center
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createIncident(form);
    onAdd();
    setForm({ title: '', description: '', severity: 'Low', location: { type: 'Point', coordinates: [20.5937, 78.9629] } });
  };

  return (
    <form className="bg-white shadow-md rounded-lg p-6 mb-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-4 text-blue-700">Report a New Incident</h2>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Incident Title"
        className="mb-3 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Incident Description"
        className="mb-3 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <select
        name="severity"
        value={form.severity}
        onChange={handleChange}
        className="mb-3 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold transition-colors duration-200"
      >
        Report Incident
      </button>
    </form>
  );
}
