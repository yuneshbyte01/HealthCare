import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * AI Status Component
 * Shows current AI model status and performance
 */
export default function AIStatus() {
  const { t } = useTranslation();
  const [aiStatus, setAiStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIStatus();
    const interval = setInterval(fetchAIStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await API.get('/ai/status');
      setAiStatus(response.data);
    } catch (error) {
      console.error('Error fetching AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              {t('ai.aiStatus')} / एआई स्थिति
            </h1>
            <button
              onClick={fetchAIStatus}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              Refresh / ताजा गर्नुहोस्
            </button>
          </div>

          {/* Overall System Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              System Overview / प्रणाली अवलोकन
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{aiStatus.overall?.uptime || '99.9%'}</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{aiStatus.overall?.totalRequests || '0'}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{aiStatus.overall?.avgResponseTime || '0'}ms</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </div>

          {/* Model Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Triage Model */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('ai.triageModel')} / ट्रायज मोडेल
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aiStatus.triageModel?.status)}`}>
                  {aiStatus.triageModel?.status || 'Unknown'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accuracy:</span>
                  <span className="text-sm font-medium">{aiStatus.triageModel?.accuracy || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Trained:</span>
                  <span className="text-sm font-medium">{aiStatus.triageModel?.lastTrained || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium">{aiStatus.triageModel?.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predictions:</span>
                  <span className="text-sm font-medium">{aiStatus.triageModel?.predictions || '0'}</span>
                </div>
              </div>
            </div>

            {/* No-Show Model */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('ai.noShowModel')} / नो-शो मोडेल
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aiStatus.noShowModel?.status)}`}>
                  {aiStatus.noShowModel?.status || 'Unknown'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accuracy:</span>
                  <span className="text-sm font-medium">{aiStatus.noShowModel?.accuracy || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Trained:</span>
                  <span className="text-sm font-medium">{aiStatus.noShowModel?.lastTrained || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium">{aiStatus.noShowModel?.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predictions:</span>
                  <span className="text-sm font-medium">{aiStatus.noShowModel?.predictions || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {aiStatus.recentActivity && (
            <div className="mt-6 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity / हालको गतिविधि
              </h2>
              <div className="space-y-3">
                {aiStatus.recentActivity.map((activity, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

