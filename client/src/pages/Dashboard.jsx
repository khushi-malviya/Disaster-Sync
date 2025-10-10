import React, { useState } from "react";
import { useIncident } from "../context/IncidentContext";
import IncidentCard from "../components/IncidentCard";
import IncidentForm from "../components/IncidentForm";
import IncidentMap from "../components/IncidentMap";
import SummaryStats from "../components/SummaryStats";
import AlertNotification from "../components/AlertNotification";
import VolunteerRequestButton from "../components/VolunteerRequestButton";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { 
    incidents, 
    fetchIncidents, 
    loading, 
    resolveIncident, 
    removeIncident 
  } = useIncident();
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertNotification />
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-3xl font-bold text-blue-700">🚨 DisasterSync</h1>
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <a
              href="/admin"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold transition-colors duration-200"
            >
              🛡️ Admin Panel
            </a>
          )}
          {user?.role === "volunteer" && (
            <a
              href="/volunteer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold transition-colors duration-200"
            >
              👨‍🚒 Volunteer Portal
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

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <SummaryStats incidents={incidents} />

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">📍 Incident Locations</h2>
          <IncidentMap incidents={incidents} />
        </div>

        <div className="mb-4">
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
              <IncidentForm
                onAdd={() => {
                  fetchIncidents();
                  setShowForm(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Volunteer role request */}
        {user?.role === "public" && (
          <div className="mb-6 text-center">
            <VolunteerRequestButton />
          </div>
        )}

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
                  onResolve={resolveIncident}
                  onDelete={removeIncident}
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

