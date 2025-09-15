import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Analytics Alerts Component
 * Shows system alerts and notifications
 */
export default function AnalyticsAlerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const response = await API.get(`/analytics/alerts?filter=${filter}`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await API.put(`/analytics/alerts/${alertId}/dismiss`);
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '��';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('analytics.alerts')} / सचेतनाहरू
            </h1>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Alerts</option>
              <option value="urgent">Urgent</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
          </div>

          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(alert => alert.type === 'urgent').length}
              </div>
              <div className="text-sm text-red-600">Urgent</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {alerts.filter(alert => alert.type === 'warning').length}
              </div>
              <div className="text-sm text-yellow-600">Warning</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {alerts.filter(alert => alert.type === 'info').length}
              </div>
              <div className="text-sm text-blue-600">Info</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(alert => alert.type === 'success').length}
              </div>
              <div className="text-sm text-green-600">Success</div>
            </div>
          </div>

          {/* Alerts List */}
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <p className="text-gray-700 mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Type: {alert.type}</span>
                          <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                          {alert.source && <span>Source: {alert.source}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {alert.actionUrl && (
                        <a
                          href={alert.actionUrl}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm transition-all"
                        >
                          View Details
                        </a>
                      )}
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'You have no alerts at this time.' 
                  : `No ${filter} alerts found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



