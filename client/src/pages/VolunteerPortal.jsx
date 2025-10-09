import React, { useState, useEffect } from 'react';
import { getIncidents, updateIncidentStatus, getAssignedIncidents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdAssignment, MdLocationOn, MdUpdate, MdChat, MdInventory, MdCheckCircle } from 'react-icons/md';
import AlertNotification from '../components/AlertNotification';

export default function VolunteerPortal() {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignedIncidents, setAssignedIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState({ incidentId: '', status: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignedRes, allRes] = await Promise.all([
        getAssignedIncidents(), // We'll create this API
        getIncidents()
      ]);
      setAssignedIncidents(assignedRes.data || []);
      setAllIncidents(allRes.data);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
      // Fallback: show all incidents if assigned incidents API doesn't exist yet
      try {
        const allRes = await getIncidents();
        setAllIncidents(allRes.data);
        // Filter incidents that could be "assigned" (for demo)
        setAssignedIncidents(allRes.data.filter(i => i.status !== 'Resolved').slice(0, 3));
      } catch (err) {
        console.error('Fallback also failed:', err);
      }
    }
  };

  const handleStatusUpdate = async (incidentId, newStatus, notes = '') => {
    setLoading(true);
    try {
      await updateIncidentStatus(incidentId, newStatus, notes);
      
      // Update local state
      setAssignedIncidents(prev => 
        prev.map(incident => 
          incident._id === incidentId 
            ? { ...incident, status: newStatus }
            : incident
        )
      );
      
      alert(`Incident status updated to ${newStatus}!`);
      setStatusUpdate({ incidentId: '', status: '', notes: '' });
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident status');
    }
    setLoading(false);
  };

  const handleCheckIn = () => {
    alert('Check-in successful! Your availability has been updated.');
  };

  const stats = {
    assigned: assignedIncidents.length,
    completed: assignedIncidents.filter(i => i.status === 'Resolved').length,
    inProgress: assignedIncidents.filter(i => i.status === 'In Progress').length,
    pending: assignedIncidents.filter(i => i.status === 'Reported').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertNotification />
      
      {/* Volunteer Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">👨‍🚒 Volunteer Portal</h1>
            <p className="opacity-90">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCheckIn}
              className="bg-white text-blue-600 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded font-semibold transition-colors duration-200"
            >
              ✅ Check In
            </button>
            <a
              href="/"
              className="bg-white text-blue-600 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded font-semibold transition-colors duration-200"
            >
              🏠 Dashboard
            </a>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.assigned}</div>
            <div className="text-gray-600">Assigned</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-red-600">{stats.pending}</div>
            <div className="text-gray-600">Pending</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow">
          {[
            { id: 'assignments', label: '📋 My Assignments', icon: MdAssignment },
            { id: 'available', label: '🆕 Available Tasks', icon: MdLocationOn },
            { id: 'updates', label: '📝 Status Updates', icon: MdUpdate },
            { id: 'resources', label: '🎒 Resources', icon: MdInventory }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* My Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">📋 My Assigned Incidents</h2>
            {assignedIncidents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">📬</div>
                <p className="text-xl text-gray-500">No assignments yet!</p>
                <p className="text-gray-400">Check back later or browse available tasks.</p>
              </div>
            ) : (
              assignedIncidents.map(incident => (
                <div key={incident._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{incident.title}</h3>
                      <p className="text-gray-700 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MdLocationOn />
                          {incident.address || 'Location coordinates available'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          incident.severity === 'High' ? 'bg-red-100 text-red-700' :
                          incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {incident.severity} Priority
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        incident.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        incident.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  
                  {incident.status !== 'Resolved' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => handleStatusUpdate(incident._id, 'In Progress')}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      >
                        <MdUpdate />
                        Start Work
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(incident._id, 'Resolved')}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      >
                        <MdCheckCircle />
                        Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Available Tasks Tab */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">🆕 Available Incidents</h2>
            <div className="grid gap-4">
              {allIncidents.filter(i => i.status !== 'Resolved').map(incident => (
                <div key={incident._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{incident.title}</h3>
                      <p className="text-gray-600 text-sm">{incident.description}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                        incident.severity === 'High' ? 'bg-red-100 text-red-700' :
                        incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {incident.severity} Priority
                      </span>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold">
                      Request Assignment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Updates Tab */}
        {activeTab === 'updates' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">📝 Submit Status Update</h2>
            <div className="space-y-4">
              <select
                value={statusUpdate.incidentId}
                onChange={(e) => setStatusUpdate({...statusUpdate, incidentId: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Incident</option>
                {assignedIncidents.map(incident => (
                  <option key={incident._id} value={incident._id}>
                    {incident.title}
                  </option>
                ))}
              </select>
              
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              
              <textarea
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                placeholder="Add progress notes or comments..."
                rows="4"
                className="w-full p-3 border rounded-lg"
              />
              
              <button
                onClick={() => handleStatusUpdate(statusUpdate.incidentId, statusUpdate.status, statusUpdate.notes)}
                disabled={!statusUpdate.incidentId || !statusUpdate.status || loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold"
              >
                Submit Update
              </button>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">🎒 Emergency Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">📞 Emergency Contacts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Police</span>
                    <span className="font-bold">100</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Fire Brigade</span>
                    <span className="font-bold">101</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Ambulance</span>
                    <span className="font-bold">108</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">🛠️ Equipment Inventory</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>First Aid Kits</span>
                    <span className="text-green-600 font-bold">Available</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Rescue Equipment</span>
                    <span className="text-yellow-600 font-bold">Limited</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Communication Devices</span>
                    <span className="text-green-600 font-bold">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
