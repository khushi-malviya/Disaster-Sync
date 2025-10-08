import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser, broadcastAlert } from '../services/api';
import { getIncidents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdPeople, MdWarning, MdNotifications, MdBarChart, MdSettings } from 'react-icons/md';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, incidentsRes] = await Promise.all([
        getAllUsers(),
        getIncidents()
      ]);
      setUsers(usersRes.data);
      setIncidents(incidentsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? {...u, role: newRole} : u));
      alert('User role updated successfully!');
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleBroadcastAlert = async () => {
    if (!alertMessage.trim()) return;
    
    setLoading(true);
    try {
      await broadcastAlert(alertMessage);
      alert('Emergency alert sent to all users!');
      setAlertMessage('');
    } catch (error) {
      alert('Failed to send alert');
    }
    setLoading(false);
  };

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    volunteerUsers: users.filter(u => u.role === 'volunteer').length,
    publicUsers: users.filter(u => u.role === 'public').length,
    totalIncidents: incidents.length,
    highPriorityIncidents: incidents.filter(i => i.severity === 'High').length,
    resolvedIncidents: incidents.filter(i => i.status === 'Resolved').length,
    activeIncidents: incidents.filter(i => i.status !== 'Resolved').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">🛡️ Admin Control Center</h1>
        <p className="opacity-90">System Management & Analytics</p>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow">
          {[
            { id: 'overview', label: '📊 Overview', icon: MdBarChart },
            { id: 'users', label: '👥 Users', icon: MdPeople },
            { id: 'alerts', label: '🚨 Alerts', icon: MdNotifications },
            { id: 'settings', label: '⚙️ Settings', icon: MdSettings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600">{stats.volunteerUsers}</div>
                <div className="text-gray-600">Volunteers</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-yellow-600">{stats.activeIncidents}</div>
                <div className="text-gray-600">Active Incidents</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl font-bold text-red-600">{stats.highPriorityIncidents}</div>
                <div className="text-gray-600">High Priority</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">📈 System Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">User Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Admins</span>
                      <span className="font-bold">{stats.adminUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volunteers</span>
                      <span className="font-bold">{stats.volunteerUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Public Users</span>
                      <span className="font-bold">{stats.publicUsers}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Incident Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-bold">{stats.totalIncidents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolved</span>
                      <span className="font-bold text-green-600">{stats.resolvedIncidents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active</span>
                      <span className="font-bold text-yellow-600">{stats.activeIncidents}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">👥 User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="public">Public</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Emergency Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🚨 Emergency Broadcast System</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Message
                </label>
                <textarea
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Enter emergency alert message..."
                  rows="4"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                onClick={handleBroadcastAlert}
                disabled={loading || !alertMessage.trim()}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <MdWarning />
                {loading ? 'Sending...' : 'Send Emergency Alert'}
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">⚙️ System Settings</h2>
            <p className="text-gray-600">System configuration options coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
