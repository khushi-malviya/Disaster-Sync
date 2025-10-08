import React, { useEffect, useState } from "react";
import { getIncidents, updateIncidentStatus, deleteIncident } from "../services/api";
import IncidentCard from "../components/IncidentCard";
import IncidentForm from "../components/IncidentForm";
import IncidentMap from "../components/IncidentMap";
import SummaryStats from "../components/SummaryStats";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  const fetchIncidents = async () => {
    try {
      const res = await getIncidents();
      setIncidents(res.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      alert('Failed to load incidents. Please refresh the page.');
    }
  };

  const handleResolveIncident = async (incidentId) => {
    if (!window.confirm('Mark this incident as resolved?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await updateIncidentStatus(incidentId, 'Resolved');
      console.log('Resolve response:', response.data);
      
      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident._id === incidentId 
            ? { ...incident, status: 'Resolved' }
            : incident
        )
      );
      alert('Incident resolved successfully!');
    } catch (error) {
      console.error('Error resolving incident:', error);
      alert(`Failed to resolve incident: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this incident?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await deleteIncident(incidentId);
      console.log('Delete response:', response.data);
      
      // Remove from local state
      setIncidents(prev => prev.filter(incident => incident._id !== incidentId));
      alert('Incident deleted successfully!');
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert(`Failed to delete incident: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
    
    // Socket event listeners
    socket.on("newIncident", (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });
    
    socket.on("incidentUpdated", (updatedIncident) => {
      setIncidents((prev) => 
        prev.map(incident => 
          incident._id === updatedIncident._id ? updatedIncident : incident
        )
      );
    });
    
    socket.on("incidentDeleted", (deletedId) => {
      setIncidents((prev) => prev.filter(incident => incident._id !== deletedId));
    });
    
    return () => {
      socket.off("newIncident");
      socket.off("incidentUpdated");
      socket.off("incidentDeleted");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-3xl font-bold text-blue-700">🚨 DisasterSync</h1>
        <div className="flex items-center gap-4">
            {/* Admin Dashboard Link */}
            {user?.role === 'admin' && (
                <a
                    href="/admin"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold transition-colors duration-200"
                >
                    🛡️ Admin Panel
                </a>
            )}
            <div className="text-right">
                <p className="text-gray-700 font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role} User</p>
            </div>
            <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors duration-200"
            >
                Logout
                </button>
        </div>
      </header>


      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-lg">Processing...</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* Summary Stats */}
        <SummaryStats incidents={incidents} />

        {/* Interactive Map */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">📍 Incident Locations</h2>
          <IncidentMap incidents={incidents} />
        </div>

        {/* Report Incident Button/Form */}
        <div className="mb-8">
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors duration-200 shadow-lg"
              >
                🚨 Report New Incident
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Report New Incident</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <IncidentForm onAdd={() => {
                fetchIncidents();
                setShowForm(false);
              }} />
            </div>
          )}
        </div>

        {/* Recent Incidents */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">📋 Recent Incidents</h2>
          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🟢</div>
              <p className="text-xl text-gray-500">No incidents reported yet.</p>
              <p className="text-gray-400">All clear in your area!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {incidents.map((incident) => (
                <IncidentCard 
                  key={incident._id} 
                  incident={incident}
                  userRole={user?.role}
                  onResolve={handleResolveIncident}
                  onDelete={handleDeleteIncident}
                  disabled={loading}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
