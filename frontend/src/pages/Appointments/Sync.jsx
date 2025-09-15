import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Sync Component
 * Handles offline appointment synchronization
 */
export default function AppointmentSync() {
  const { t } = useTranslation();
  const [pendingSync, setPendingSync] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    checkPendingSync();
  }, []);

  const checkPendingSync = async () => {
    try {
      const response = await API.get('/appointments/pending-sync');
      setPendingSync(response.data);
    } catch (error) {
      console.error('Error checking pending sync:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('');

    try {
      const response = await API.post('/appointments/sync');
      setSyncStatus('Sync completed successfully!');
      setPendingSync([]);
    } catch (error) {
      setSyncStatus('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('appointments.sync')} / समक्रमण
          </h1>

          <div className="space-y-6">
            {/* Sync Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Sync Status / समक्रमण स्थिति
              </h2>
              <p className="text-blue-800">
                {pendingSync.length > 0 
                  ? `You have ${pendingSync.length} appointments pending sync.`
                  : 'All appointments are synced.'
                }
              </p>
            </div>

            {/* Pending Sync Items */}
            {pendingSync.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Sync Items / बाँकी समक्रमण वस्तुहरू
                </h2>
                {pendingSync.map((item, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-yellow-900">{item.type}</h3>
                        <p className="text-yellow-800 text-sm">{item.description}</p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Created: {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sync Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSync}
                disabled={syncing || pendingSync.length === 0}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? t('common.loading') : 'Sync Now / अहिले समक्रमण गर्नुहोस्'}
              </button>
            </div>

            {/* Sync Status Message */}
            {syncStatus && (
              <div className={`p-4 rounded-lg ${
                syncStatus.includes('success') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {syncStatus}
              </div>
            )}

            {/* Help Text */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How Sync Works / समक्रमण कसरी काम गर्छ</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• When you're offline, appointments are saved locally</li>
                <li>• Use this sync feature to upload them when you're back online</li>
                <li>• All your data will be safely synchronized with the server</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

