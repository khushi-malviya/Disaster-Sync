import React, { useState } from 'react';
import { createIncident } from '../services/api';

export default function IncidentForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'Low',
    location: { type: 'Point', coordinates: [0, 0] },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createIncident(form);
    onAdd();
    setForm({ title: '', description: '', severity: 'Low', location: { type: 'Point', coordinates: [0, 0] } });
  };

  return (
    <form className="bg-gray-100 p-4 rounded mb-4" onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="mb-2 p-2 w-full" required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="mb-2 p-2 w-full" required />
      <select name="severity" value={form.severity} onChange={handleChange} className="mb-2 p-2 w-full">
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Report Incident</button>
    </form>
  );
}
