import React from 'react';
import { formatDate } from '../utils/formatDate';

export default function IncidentCard({ incident }) {
  return (
    <div className="bg-white shadow-md rounded p-4 mb-4">
      <h3 className="text-lg font-bold">{incident.title}</h3>
      <p>{incident.description}</p>
      <p className="text-sm text-gray-500">Severity: {incident.severity}</p>
      <p className="text-sm text-gray-500">Status: {incident.status}</p>
      <p className="text-xs text-gray-400">Reported: {formatDate(incident.reportedAt)}</p>
    </div>
  );
}
