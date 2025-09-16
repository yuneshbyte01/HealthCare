import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Performance Analytics Component
 * Shows AI model performance and system metrics
 */
export default function PerformanceAnalytics() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [performanceData, setPerformanceData] = useState({
    ai_performance: [],
    model_status: {
      triage_model: 'unknown',
      noshow_model: 'unknown',
      last_retrain: null
    }
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await API.get('/analytics/performance');
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setMessage('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
              {t('analytics.performance')}
            </h1>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            {/* Model Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceData.model_status.triage_model === 'active' ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-blue-600">Triage Model</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {performanceData.model_status.noshow_model === 'active' ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-green-600">No-Show Model</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceData.model_status.last_retrain 
                    ? new Date(performanceData.model_status.last_retrain).toLocaleDateString()
                    : 'Never'
                  }
                </div>
                <div className="text-sm text-purple-600">Last Retrain</div>
              </div>
            </div>

            {/* AI Performance by Urgency */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance by Urgency Level</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg No-Show Risk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performanceData.ai_performance.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {item.urgency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(parseFloat(item.avg_noshow_risk || 0) * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              parseFloat(item.avg_noshow_risk || 0) > 0.6 ? 'bg-red-100 text-red-800' :
                              parseFloat(item.avg_noshow_risk || 0) > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {parseFloat(item.avg_noshow_risk || 0) > 0.6 ? 'High Risk' :
                               parseFloat(item.avg_noshow_risk || 0) > 0.3 ? 'Medium Risk' : 'Low Risk'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Model Status Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Triage Model Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(performanceData.model_status.triage_model)}`}>
                      {performanceData.model_status.triage_model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Retrain:</span>
                    <span className="text-sm font-medium">
                      {performanceData.model_status.last_retrain 
                        ? new Date(performanceData.model_status.last_retrain).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Predictions (30 days):</span>
                    <span className="text-sm font-medium">
                      {performanceData.ai_performance.reduce((sum, item) => sum + parseInt(item.count), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  No-Show Model Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(performanceData.model_status.noshow_model)}`}>
                      {performanceData.model_status.noshow_model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Retrain:</span>
                    <span className="text-sm font-medium">
                      {performanceData.model_status.last_retrain 
                        ? new Date(performanceData.model_status.last_retrain).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Risk Score:</span>
                    <span className="text-sm font-medium">
                      {performanceData.ai_performance.length > 0 
                        ? (performanceData.ai_performance.reduce((sum, item) => sum + parseFloat(item.avg_noshow_risk || 0), 0) / performanceData.ai_performance.length * 100).toFixed(1) + '%'
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Model Health</h4>
                  <p className="text-sm text-gray-600">
                    {performanceData.model_status.triage_model === 'active' && performanceData.model_status.noshow_model === 'active'
                      ? 'Both AI models are active and performing well.'
                      : 'Some AI models may need attention or retraining.'
                    }
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Monitor model performance regularly</li>
                    <li>• Retrain models with new data monthly</li>
                    <li>• Validate predictions against actual outcomes</li>
                    <li>• Update models based on changing patterns</li>
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
