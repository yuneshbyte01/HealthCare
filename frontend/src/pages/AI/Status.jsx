import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * AI Status Component
 * Shows current AI model status and performance
 */
export default function AIStatus() {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();
  const [aiStatus, setAiStatus] = useState({
    success: false,
    status: 'unknown',
    statistics: {
      total_ai_requests: 0,
      recent_retrains: 0,
      last_retrain: null,
      models_status: {
        triage_model: 'unknown',
        noshow_model: 'unknown'
      }
    },
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAIStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await API.get('/ai/status');
      setAiStatus(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error fetching AI status:', error);
      setMessage('Failed to load AI status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'operational': return '✅';
      case 'training': return '🔄';
      case 'error': return '❌';
      case 'failed': return '❌';
      default: return '❓';
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
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {t('ai.aiStatus')}
              </h1>
              <button
                onClick={fetchAIStatus}
                className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            {/* Overall System Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                System Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getStatusIcon(aiStatus.status)}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(aiStatus.status)}`}>
                      {aiStatus.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {aiStatus.statistics.total_ai_requests}
                  </div>
                  <div className="text-sm text-gray-600">Total AI Requests</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {aiStatus.statistics.recent_retrains}
                  </div>
                  <div className="text-sm text-gray-600">Recent Retrains</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">
                    {aiStatus.statistics.last_retrain 
                      ? new Date(aiStatus.statistics.last_retrain).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Last Retrain</div>
                </div>
              </div>
            </div>

            {/* Model Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Triage Model */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('ai.triageModel')}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aiStatus.statistics.models_status.triage_model)}`}>
                    {aiStatus.statistics.models_status.triage_model}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium capitalize">
                      {aiStatus.statistics.models_status.triage_model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Purpose:</span>
                    <span className="text-sm font-medium">Urgency Classification</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Update:</span>
                    <span className="text-sm font-medium">
                      {aiStatus.statistics.last_retrain 
                        ? new Date(aiStatus.statistics.last_retrain).toLocaleString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* No-Show Model */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('ai.noShowModel')}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aiStatus.statistics.models_status.noshow_model)}`}>
                    {aiStatus.statistics.models_status.noshow_model}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium capitalize">
                      {aiStatus.statistics.models_status.noshow_model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Purpose:</span>
                    <span className="text-sm font-medium">No-Show Prediction</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Update:</span>
                    <span className="text-sm font-medium">
                      {aiStatus.statistics.last_retrain 
                        ? new Date(aiStatus.statistics.last_retrain).toLocaleString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {aiStatus.recent_activity && aiStatus.recent_activity.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {aiStatus.recent_activity.map((activity, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.details?.status || 'No details available'}
                          </p>
                          {activity.details?.requested_by && (
                            <p className="text-xs text-gray-500 mt-1">
                              Requested by: {activity.details.requested_by}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Service Information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">AI Service Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Available Models</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Triage Model - Patient urgency classification</li>
                    <li>• No-Show Model - Appointment attendance prediction</li>
                    <li>• NLP Triage - Multilingual symptom analysis</li>
                    <li>• ML Fallback - Backup classification system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Service Features</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Real-time predictions</li>
                    <li>• Automatic model retraining</li>
                    <li>• Performance monitoring</li>
                    <li>• Error logging and recovery</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Overall Status</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getStatusIcon(aiStatus.status)}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(aiStatus.status)}`}>
                      {aiStatus.status}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Last Check</h4>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Auto Refresh</h4>
                  <p className="text-sm text-gray-600">
                    Every 30 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

