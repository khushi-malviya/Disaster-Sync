import React from 'react';
import { formatDate } from '../utils/formatDate';

const severityColors = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const statusColors = {
  Reported: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  Resolved: 'bg-green-100 text-green-700',
};

export default function IncidentCard({ incident }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-5 mb-4 border-l-4 border-blue-400 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">{incident.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityColors[incident.severity]}`}>
          {incident.severity}
        </span>
      </div>
      <p className="text-gray-700 mb-2">{incident.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className={`px-2 py-1 rounded ${statusColors[incident.status]}`}>{incident.status}</span>
        <span className="text-gray-400">{formatDate(incident.reportedAt)}</span>
      </div>
    </div>
  );
}
