import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Sync Component
 * Handles synchronization of appointment data with the backend
 */
export default function SyncAppointments() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [message, setMessage] = useState('');
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    symptoms: ''
  });

  useEffect(() => {
    // Get last sync time from localStorage
    const lastSyncTime = localStorage.getItem('lastAppointmentSync');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }
    
    // Load pending appointments from localStorage
    const pending = localStorage.getItem('pendingAppointments');
    if (pending) {
      setPendingAppointments(JSON.parse(pending));
    }
  }, []);

  const handleAddPendingAppointment = () => {
    if (!newAppointment.date || !newAppointment.symptoms.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    const appointment = {
      id: Date.now(), // Temporary ID
      date: newAppointment.date,
      symptoms: newAppointment.symptoms,
      status: 'pending_sync',
      created_at: new Date().toISOString()
    };

    const updatedPending = [...pendingAppointments, appointment];
    setPendingAppointments(updatedPending);
    localStorage.setItem('pendingAppointments', JSON.stringify(updatedPending));
    
    setNewAppointment({ date: '', symptoms: '' });
    setMessage('Appointment added to sync queue');
  };

  const handleRemovePendingAppointment = (id) => {
    const updatedPending = pendingAppointments.filter(apt => apt.id !== id);
    setPendingAppointments(updatedPending);
    localStorage.setItem('pendingAppointments', JSON.stringify(updatedPending));
  };

  const handleSync = async () => {
    if (pendingAppointments.length === 0) {
      setMessage('No pending appointments to sync');
      return;
    }

    setSyncStatus('syncing');
    setMessage('');
    setSyncResults(null);

    try {
      console.log('Syncing appointments:', pendingAppointments);
      
      const response = await API.post('/sync', {
        appointments: pendingAppointments.map(apt => ({
          date: apt.date,
          symptoms: apt.symptoms
        }))
      });
      
      console.log('Sync response:', response.data);
      
      setSyncResults(response.data);
      setSyncStatus('completed');
      setMessage('Appointments synchronized successfully!');
      
      // Clear pending appointments after successful sync
      setPendingAppointments([]);
      localStorage.removeItem('pendingAppointments');
      
      // Update last sync time
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastAppointmentSync', now.toISOString());
    } catch (error) {
      console.error('Error syncing appointments:', error);
      setSyncStatus('error');
      setMessage(error.response?.data?.error || 'Failed to synchronize appointments');
    }
  };

  const handleClearPending = () => {
    setPendingAppointments([]);
    localStorage.removeItem('pendingAppointments');
    setMessage('Pending appointments cleared');
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500">Please log in to access sync functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">
              {t('appointments.sync')}
            </h1>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Sync Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Synchronization Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSyncStatusColor(syncStatus)}`}>
                    {syncStatus === 'idle' ? 'Ready' : syncStatus}
                  </span>
                  {lastSync && (
                    <span className="text-sm text-gray-600">
                      Last sync: {lastSync.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Pending: {pendingAppointments.length} appointments
                </div>
              </div>
            </div>

            {/* Add New Appointment */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Appointment to Sync Queue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms / Reason *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.symptoms}
                    onChange={(e) => setNewAppointment({ ...newAppointment, symptoms: e.target.value })}
                    placeholder="Describe symptoms or reason for visit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAddPendingAppointment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
                >
                  Add to Sync Queue
                </button>
              </div>
            </div>

            {/* Pending Appointments */}
            {pendingAppointments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending Appointments ({pendingAppointments.length})
                  </h3>
                  <button
                    onClick={handleClearPending}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3">
                  {pendingAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePendingAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Button */}
            <div className="text-center mb-6">
              <button
                onClick={handleSync}
                disabled={syncStatus === 'syncing' || pendingAppointments.length === 0}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus === 'syncing' ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Syncing...</span>
                  </div>
                ) : (
                  `Sync ${pendingAppointments.length} Appointments`
                )}
              </button>
            </div>

            {/* Sync Results */}
            {syncResults && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Sync Results</h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Sync Complete</h4>
                  <p className="text-green-800 mb-3">{syncResults.message}</p>
                  
                  {syncResults.syncedAppointments && (
                    <div>
                      <h5 className="font-medium text-green-900 mb-2">Synced Appointments:</h5>
                      <div className="space-y-2">
                        {syncResults.syncedAppointments.map((appointment, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">ID:</span> {appointment.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Status:</span> {appointment.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sync Information */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">About Synchronization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">How it Works</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Add appointments to the sync queue</li>
                    <li>• Sync multiple appointments at once</li>
                    <li>• Appointments are saved to the central database</li>
                    <li>• All sync activities are logged</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Benefits</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Offline appointment creation</li>
                    <li>• Batch synchronization</li>
                    <li>• Data consistency across devices</li>
                    <li>• Reduced network usage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Sync Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">User ID:</span> {user?.id}</p>
                <p><span className="font-medium">Role:</span> {user?.role}</p>
                <p><span className="font-medium">Pending Appointments:</span> {pendingAppointments.length}</p>
                {lastSync && (
                  <p><span className="font-medium">Last Sync:</span> {lastSync.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

