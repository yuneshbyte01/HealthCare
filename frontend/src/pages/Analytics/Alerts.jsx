import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Analytics Alerts Component
 * Shows system alerts and health notifications
 */
export default function AnalyticsAlerts() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [alertsData, setAlertsData] = useState({
    alerts: [],
    summary: {
      urgent_cases_this_week: 0,
      high_risk_noshow: 0,
      capacity_alerts: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await API.get('/analytics/alerts');
      setAlertsData(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setMessage('Failed to load alerts data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">
              {t('analytics.alerts')}
            </h1>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {alertsData.summary.urgent_cases_this_week}
                </div>
                <div className="text-sm text-red-600">Urgent Cases This Week</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {alertsData.summary.high_risk_noshow}
                </div>
                <div className="text-sm text-yellow-600">High No-Show Risk</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {alertsData.summary.capacity_alerts}
                </div>
                <div className="text-sm text-blue-600">Capacity Alerts</div>
              </div>
            </div>

            {/* Alerts List */}
            {alertsData.alerts.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
                {alertsData.alerts.map((alert, index) => (
                  <div key={index} className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Severity: {alert.severity}</span>
                          <span>Count: {alert.count}</span>
                          {alert.threshold && <span>Threshold: {alert.threshold}</span>}
                          {alert.clinic && <span>Clinic: {alert.clinic}</span>}
                          {alert.utilization && <span>Utilization: {alert.utilization}%</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-500">
                  All systems are operating normally. No alerts to display at this time.
                </p>
              </div>
            )}

            {/* System Status */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Health Monitoring</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Urgent Cases:</span>
                      <span className={`text-sm font-medium ${
                        alertsData.summary.urgent_cases_this_week > 10 ? 'text-red-600' :
                        alertsData.summary.urgent_cases_this_week > 5 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {alertsData.summary.urgent_cases_this_week > 10 ? 'High' :
                         alertsData.summary.urgent_cases_this_week > 5 ? 'Moderate' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">No-Show Risk:</span>
                      <span className={`text-sm font-medium ${
                        alertsData.summary.high_risk_noshow > 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {alertsData.summary.high_risk_noshow > 5 ? 'Elevated' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className={`text-sm font-medium ${
                        alertsData.summary.capacity_alerts > 0 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {alertsData.summary.capacity_alerts > 0 ? 'At Risk' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {alertsData.summary.urgent_cases_this_week > 10 && (
                      <li>• Consider increasing urgent care capacity</li>
                    )}
                    {alertsData.summary.high_risk_noshow > 5 && (
                      <li>• Implement follow-up reminders for high-risk appointments</li>
                    )}
                    {alertsData.summary.capacity_alerts > 0 && (
                      <li>• Review clinic capacity and scheduling</li>
                    )}
                    {alertsData.summary.urgent_cases_this_week <= 5 && 
                     alertsData.summary.high_risk_noshow <= 5 && 
                     alertsData.summary.capacity_alerts === 0 && (
                      <li>• System operating optimally</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



