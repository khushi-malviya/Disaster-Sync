import React, { useState } from 'react';
import { createIncident } from '../services/api';
import { MdAddAlert, MdLocationOn } from 'react-icons/md';

export default function IncidentForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'Low',
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }, // Default: Delhi
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const newCoordinates = [...form.location.coordinates];
      if (name === 'longitude') newCoordinates[0] = parseFloat(value) || 0;
      if (name === 'latitude') newCoordinates[1] = parseFloat(value) || 0;
      setForm({
        ...form,
        location: { ...form.location, coordinates: newCoordinates }
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setForm({
          ...form,
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          }
        });
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createIncident(form);
      onAdd();
      setForm({
        title: '',
        description: '',
        severity: 'Low',
        location: { type: 'Point', coordinates: [77.1025, 28.7041] },
        address: ''
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Failed to create incident. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <form className="bg-white shadow-lg rounded-lg p-6 border" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center">
        <MdAddAlert className="mr-2" />
        Report Emergency Incident
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Incident Title (e.g., Building Fire, Flood, Accident)"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of the incident..."
            rows="3"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <select
            name="severity"
            value={form.severity}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Low">🟢 Low Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="High">🔴 High Priority</option>
          </select>
        </div>

        <div>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address or Location Description"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
          <input
            type="number"
            name="longitude"
            value={form.location.coordinates[0]}
            onChange={handleLocationChange}
            step="any"
            placeholder="77.1025"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <input
            type="number"
            name="latitude"
            value={form.location.coordinates[1]}
            onChange={handleLocationChange}
            step="any"
            placeholder="28.7041"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200"
        >
          <MdLocationOn />
          Use My Location
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200"
        >
          <MdAddAlert />
          {isSubmitting ? 'Reporting...' : 'Report Incident'}
        </button>
      </div>
    </form>
  );
}
