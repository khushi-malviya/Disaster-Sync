import React, { useEffect, useState } from 'react';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getPendingVolunteerRequests,
  updateVolunteerRequestStatus,
  getIncidents,
  assignIncidentToVolunteer,
  broadcastAlert,
  getInventoryItems,
  updateInventoryItem,
  getAllInventoryRequests,
  updateInventoryRequestStatus,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { MdPeople, MdWarning, MdNotifications, MdBarChart, MdSettings, MdInventory ,MdInventory2} from 'react-icons/md';

const socket = io('http://localhost:5000');

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [inventoryRequests, setInventoryRequests] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchData();
    fetchInventory();
    fetchInventoryRequests();
  }, [user]);
  
   useEffect(() => {
    socket.on('inventoryLow', alert => {
      setInventoryAlerts(prev => [...prev, alert]);
    });
    return () => socket.off('inventoryLow');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, requestsRes, incidentsRes] = await Promise.all([
        getAllUsers(),
        getPendingVolunteerRequests(),
        getIncidents()
      ]);
      setUsers(usersRes.data);
      setRequests(requestsRes.data);
      setIncidents(incidentsRes.data);
    } catch {
      alert('Failed to load data');
    }
    setLoading(false);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getInventoryItems();
      setInventory(res.data);
    } catch {
      alert('Failed to load inventory');
    }
    setLoading(false);
  };
  const fetchInventoryRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllInventoryRequests();
      setInventoryRequests(res.data);
    } catch {
      alert('Failed to load inventory requests');
    }
    setLoading(false);
  };


  // Volunteer Requests
  const handleRequestStatus = async (id, status) => {
    if (!window.confirm(`Mark request as ${status}?`)) return;
    setLoading(true);
    try {
      await updateVolunteerRequestStatus(id, status);
      setRequests(reqs =>
        reqs.map(r => (r._id === id ? { ...r, status } : r))
      );
      if (status === 'Approved') await fetchData();
      alert('Request updated');
    } catch {
      alert('Failed to update request');
    }
    setLoading(false);
  };

  // Emergency Alert Broadcast
  const handleBroadcastAlert = async () => {
    if (!alertMessage.trim()) {
      alert('Enter alert message.');
      return;
    }
    setLoading(true);
    try {
      await broadcastAlert(alertMessage);
      alert('Alert sent!');
      setAlertMessage('');
    } catch {
      alert('Failed to send alert');
    }
    setLoading(false);
  };

  // Assign Volunteers to Incidents
  const handleAssignVolunteer = async (incidentId, volunteerId) => {
    if (!volunteerId) return alert('Select a volunteer');
    setLoading(true);
    try {
      await assignIncidentToVolunteer(incidentId, volunteerId);
      setIncidents(prev =>
        prev.map(i =>
          i._id === incidentId ? { ...i, assignedTo: volunteerId } : i
        )
      );
      alert('Volunteer assigned');
    } catch {
      alert('Failed to assign volunteer');
    }
    setLoading(false);
  };

  // User Management
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    setLoading(true);
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
      alert('User role updated');
    } catch {
      alert('Failed to update role');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      alert('User deleted');
    } catch {
      alert('Failed to delete user');
    }
    setLoading(false);
  };

  const handleInventoryEdit = async (id, updatedQty) => {
    if (isNaN(updatedQty) || updatedQty < 0) return;
    setEditingId(id);
    try {
      await updateInventoryItem(id, Number(updatedQty));
      setInventory(prev =>
        prev.map(item => item._id === id ? { ...item, quantity: Number(updatedQty) } : item)
      );
      alert('Inventory updated!');
    } catch {
      alert('Failed to update inventory');
    }
    setEditingId(null);
  };
  const handleInventoryRequestStatus = async (id, status) => {
    if (!window.confirm(`Mark inventory request as ${status}?`)) return;
    setLoading(true);
    try {
     await updateInventoryRequestStatus(id, status);
     setInventoryRequests(prev =>
      prev.map(req => (req._id === id ? { ...req, status } : req))
     );
     if (status === 'Fulfilled') fetchInventory(); // refresh stock
     alert('Inventory request updated');
    } catch {
     alert('Failed to update inventory request');
    }
    setLoading(false);
  };

  // Stats for Overview Tab
  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    volunteers: users.filter(u => u.role === 'volunteer').length,
    publicUsers: users.filter(u => u.role === 'public').length,
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter(i => i.status !== 'Resolved').length,
    resolvedIncidents: incidents.filter(i => i.status === 'Resolved').length,
    pendingRequests: requests.filter((r) => r.status === 'Pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-7xl mx-auto flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700">Admin Control Center</h1>
        <p className="text-gray-600 mt-1">Manage users, incidents, alerts, and more</p>
      </header>
      {/* Inventory shortage alert (live popup) */}
      {inventoryAlerts.length > 0 && (
        <div className="fixed top-6 right-6 z-40 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded shadow-lg">
          <strong>Inventory Alert:</strong>
          {inventoryAlerts.map((alert, idx) => (
            <div key={idx}>
              <span className="font-bold">{alert.name}</span> is low ({alert.quantity} left, minimum {alert.threshold} needed)!
            </div>
          ))}
        </div>
      )}


      {/* Tabs */}
      <nav className="flex space-x-6 border-b border-gray-300 mb-6">
        {[
          { id: 'overview', label: '📊 Overview', icon: MdBarChart },
          { id: 'requests', label: '👥 Volunteer Requests', icon: MdPeople },
          { id: 'alerts', label: '🚨 Broadcast Alert', icon: MdNotifications },
          { id: 'assignments', label: '🛠️ Incident Assignments', icon: MdWarning },
          { id: 'inventory', label: '📦 Inventory', icon: MdInventory },
          { id: 'inv-requests', label: '📋 Inventory Requests', icon: MdInventory2 },
          { id: 'users', label: '⚙️ User Management', icon: MdSettings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 border-b-4 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-blue-500'
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <tab.icon className="text-xl" />
            {tab.label}
            {tab.id === 'inventory' && inventoryAlerts.length > 0 && (
              <span className="ml-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{inventoryAlerts.length}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-grow flex gap-6">
        {/* Overview */}
        {activeTab === 'overview' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6 text-center grid grid-cols-4 gap-6">
            <div className="bg-blue-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-bold">{stats.totalUsers}</div>
              <div>Total Users</div>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-bold">{stats.volunteers}</div>
              <div>Volunteers</div>
            </div>
            <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-bold">{stats.activeIncidents}</div>
              <div>Active Incidents</div>
            </div>
            <div className="bg-red-500 text-white rounded-lg p-4 shadow-lg">
              <div className="text-4xl font-bold">{stats.pendingRequests}</div>
              <div>Pending Requests</div>
            </div>
          </section>
        )}

        {/* Volunteer Requests */}
        {activeTab === 'requests' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">Volunteer Role Requests</h2>
            {requests.length === 0 ? <p>No pending requests.</p> : (
              <table className="w-full text-left border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border border-gray-300">User</th>
                    <th className="p-3 border border-gray-300">Status</th>
                    <th className="p-3 border border-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300">{req.userId?.name} ({req.userId?.email})</td>
                      <td className="p-3 border border-gray-300">{req.status}</td>
                      <td className="p-3 border border-gray-300 space-x-2">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleRequestStatus(req._id, 'Approved')}
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestStatus(req._id, 'Rejected')}
                              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* Alert Broadcast */}
        {activeTab === 'alerts' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Emergency Alert Broadcast</h2>
            <textarea
              rows={6}
              value={alertMessage}
              onChange={e => setAlertMessage(e.target.value)}
              placeholder="Enter alert message..."
              className="w-full p-3 border rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
            />
            <button
              onClick={handleBroadcastAlert}
              disabled={loading || !alertMessage.trim()}
              className="px-6 py-3 rounded bg-red-600 text-white font-bold disabled:opacity-50 hover:bg-red-700"
            >
              {loading ? 'Sending...' : 'Send Alert'}
            </button>
          </section>
        )}

        {/* Incident Assignments */}
        {activeTab === 'assignments' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">Assign Volunteers</h2>
            {incidents.length === 0 ? <p>No incidents available.</p> : (
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border border-gray-300">Incident</th>
                    <th className="p-3 border border-gray-300">Assigned Volunteer</th>
                    <th className="p-3 border border-gray-300">Assign To</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(incident => (
                    <tr key={incident._id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300">{incident.title}</td>
                      <td className="p-3 border border-gray-300">
                        {incident.assignedTo ? users.find(u => u._id === incident.assignedTo)?.name || 'Unknown' : 'Unassigned'}
                      </td>
                      <td className="p-3 border border-gray-300">
                        <select
                          onChange={e => handleAssignVolunteer(incident._id, e.target.value)}
                          defaultValue=""
                          className="border p-1 rounded"
                        >
                          <option value="" disabled>Select Volunteer</option>
                          {users.filter(u => u.role === 'volunteer').map(vol => (
                            <option key={vol._id} value={vol._id}>{vol.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
        {activeTab === 'inventory' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">Equipment Inventory</h2>
            {inventory.length === 0 ? (
              <p>No inventory items found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Item</th>
                    <th className="border p-2">Current Qty</th>
                    <th className="border p-2">Min Required</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item._id} className={item.quantity < item.minRequired ? 'bg-red-50' : ''}>
                      <td className="border p-2">{item.name}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          disabled={editingId === item._id}
                          onChange={e => handleInventoryEdit(item._id, e.target.value)}
                          className="w-20 border px-1 rounded"
                        />
                      </td>
                      <td className="border p-2">{item.minRequired}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleInventoryEdit(item._id, item.minRequired)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                          disabled={editingId === item._id}
                        >
                          Restock to minimum
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-2 text-xs text-gray-600">
              Red row indicates low inventory that needs admin attention.
            </p>
          </section>
        )}

        {activeTab === 'inv-requests' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">Volunteer Inventory Requests</h2>
            {inventoryRequests.length === 0 ? (
              <p>No inventory requests currently.</p>
            ) : (
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border border-gray-300">Volunteer</th>
                    <th className="p-3 border border-gray-300">Item</th>
                    <th className="p-3 border border-gray-300">Requested Qty</th>
                    <th className="p-3 border border-gray-300">Status</th>
                    <th className="p-3 border border-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryRequests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300">{req.volunteerId?.name || 'Unknown'}</td>
                      <td className="p-3 border border-gray-300">{req.itemId?.name || 'Unknown'}</td>
                      <td className="p-3 border border-gray-300">{req.requestedQty}</td>
                      <td className="p-3 border border-gray-300">{req.status}</td>
                      <td className="p-3 border border-gray-300 space-x-2">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleInventoryRequestStatus(req._id, 'Approved')}
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleInventoryRequestStatus(req._id, 'Denied')}
                              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Deny
                            </button>
                          </>
                        )}
                        {req.status !== 'Pending' && (
                          <span className="italic text-gray-600">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <section className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            {users.length === 0 ? <p>No users found.</p> : (
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border border-gray-300">Name</th>
                    <th className="p-3 border border-gray-300">Email</th>
                    <th className="p-3 border border-gray-300">Role</th>
                    <th className="p-3 border border-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-300">{u.name}</td>
                      <td className="p-3 border border-gray-300">{u.email}</td>
                      <td className="p-3 border border-gray-300">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="public">Public</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 border border-gray-300">
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
            )}
          </section>
        )}
      </div>
    </div>
  );
}
