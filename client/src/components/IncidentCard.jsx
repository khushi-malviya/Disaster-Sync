import React from 'react';
import { formatDate } from '../utils/formatDate';
import { MdWarning, MdCheckCircle, MdError, MdReport } from 'react-icons/md';

const severityIcons = {
  Low: <MdCheckCircle className="text-green-500 inline mr-1" />,
  Medium: <MdWarning className="text-yellow-500 inline mr-1" />,
  High: <MdError className="text-red-500 inline mr-1" />,
};

const statusIcons = {
  Reported: <MdReport className="text-blue-500 inline mr-1" />,
  'In Progress': <MdWarning className="text-yellow-500 inline mr-1" />,
  Resolved: <MdCheckCircle className="text-green-500 inline mr-1" />,
};

export default function IncidentCard({ incident }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-5 mb-4 border-l-4 border-blue-400 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold flex items-center">
          {severityIcons[incident.severity]}
          {incident.title}
        </h3>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 flex items-center">
          {statusIcons[incident.status]}
          {incident.status}
        </span>
      </div>
      <p className="text-gray-700 mb-2">{incident.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formatDate(incident.reportedAt)}</span>
      </div>
    </div>
  );
}
