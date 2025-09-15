import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Performance Analytics Component
 * Shows system and AI model performance metrics (simplified version)
 */
export default function PerformanceAnalytics() {
  const { t } = useTranslation();
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await API.get(`/analytics/performance?period=${selectedPeriod}`);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Mock data for development
      setPerformanceData({
        metrics: {
          avgResponseTime: 120,
          uptime: '99.9%',
          aiAccuracy: '94%',
          totalRequests: 1250
        },
        systemPerformance: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          responseTime: [110, 125, 115, 130, 120, 105, 100],
          cpuUsage: [45, 52, 48, 55, 50, 40, 35]
        },
        aiAccuracy: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          triage: [92, 94, 93, 95],
          noShow: [88, 90, 89, 91]
        },
        triageModel: {
          accuracy: '95%',
          predictions: 450,
          lastTraining: '2024-01-15',
          version: 'v2.1'
        },
        noShowModel: {
          accuracy: '91%',
          predictions: 380,
          lastTraining: '2024-01-10',
          version: 'v1.8'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

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
              {t('analytics.performance')} / प्रदर्शन
            </h1>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{performanceData.metrics?.avgResponseTime || 0}ms</div>
              <div className="text-sm text-blue-600">Avg Response Time</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{performanceData.metrics?.uptime || '99.9%'}</div>
              <div className="text-sm text-green-600">System Uptime</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{performanceData.metrics?.aiAccuracy || '94%'}</div>
              <div className="text-sm text-purple-600">AI Accuracy</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{performanceData.metrics?.totalRequests || 0}</div>
              <div className="text-sm text-yellow-600">Total Requests</div>
            </div>
          </div>

          {/* System Performance Chart */}
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance Over Time</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Response Time (ms)</h4>
                  <div className="space-y-2">
                    {performanceData.systemPerformance?.labels?.map((label, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(performanceData.systemPerformance.responseTime[index] / Math.max(...performanceData.systemPerformance.responseTime)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{performanceData.systemPerformance.responseTime[index]}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">CPU Usage (%)</h4>
                  <div className="space-y-2">
                    {performanceData.systemPerformance?.labels?.map((label, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${performanceData.systemPerformance.cpuUsage[index]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{performanceData.systemPerformance.cpuUsage[index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Accuracy Chart */}
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Accuracy Over Time</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Triage Model</h4>
                  <div className="space-y-2">
                    {performanceData.aiAccuracy?.labels?.map((label, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${performanceData.aiAccuracy.triage[index]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{performanceData.aiAccuracy.triage[index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">No-Show Model</h4>
                  <div className="space-y-2">
                    {performanceData.aiAccuracy?.labels?.map((label, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${performanceData.aiAccuracy.noShow[index]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{performanceData.aiAccuracy.noShow[index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Performance Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Triage Model Performance / ट्रायज मोडेल प्रदर्शन
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Accuracy:</span>
                  <span className="text-sm font-medium">{performanceData.triageModel?.accuracy || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predictions Made:</span>
                  <span className="text-sm font-medium">{performanceData.triageModel?.predictions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Training:</span>
                  <span className="text-sm font-medium">{performanceData.triageModel?.lastTraining || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Model Version:</span>
                  <span className="text-sm font-medium">{performanceData.triageModel?.version || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                No-Show Model Performance / नो-शो मोडेल प्रदर्शन
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Accuracy:</span>
                  <span className="text-sm font-medium">{performanceData.noShowModel?.accuracy || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predictions Made:</span>
                  <span className="text-sm font-medium">{performanceData.noShowModel?.predictions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Training:</span>
                  <span className="text-sm font-medium">{performanceData.noShowModel?.lastTraining || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Model Version:</span>
                  <span className="text-sm font-medium">{performanceData.noShowModel?.version || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
