import React, { useState } from 'react';
import { requestVolunteerRole } from '../services/api';

export default function VolunteerRequestButton() {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      await requestVolunteerRole();
      alert('Volunteer role request submitted!');
      setRequested(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit request');
    }
    setLoading(false);
  };

  if (requested) {
    return (
      <p className="text-green-600 font-semibold">
        Request submitted, awaiting approval.
      </p>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      {loading ? 'Submitting...' : 'Request Volunteer Role'}
    </button>
  );
}
