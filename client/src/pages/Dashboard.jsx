import React, { useEffect, useState } from 'react';
import { getIncidents } from '../services/api';
import IncidentCard from '../components/IncidentCard';
import IncidentForm from '../components/IncidentForm';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = async () => {
    const res = await getIncidents();
    setIncidents(res.data);
  };

  useEffect(() => {
    fetchIncidents();
    socket.on('newIncident', (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });
    return () => socket.off('newIncident');
  }, []);

  return (

    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">DisasterSync Dashboard</h2>
      <IncidentForm onAdd={fetchIncidents} />
      {incidents.map((incident) => (
        <IncidentCard key={incident._id} incident={incident} />
      ))}
    </div>
  );
}
