import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Analytics Trends Component
 * Shows appointment trends, urgency distribution, and no-show patterns
 */
export default function AnalyticsTrends() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [trendsData, setTrendsData] = useState({
    urgency_distribution: [],
    daily_trends: [],
    noshow_risk_distribution: [],
    total_appointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchTrendsData = useCallback(async () => {
    try {
      const response = await API.get('/analytics/trends');
      setTrendsData(response.data);
    } catch (error) {
      console.error('Error fetching trends data:', error);
      setMessage('Failed to load trends data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendsData();
  }, [fetchTrendsData]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high_risk': return 'bg-red-100 text-red-800';
      case 'medium_risk': return 'bg-yellow-100 text-yellow-800';
      case 'low_risk': return 'bg-green-100 text-green-800';
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
              {t('analytics.trends')}
            </h1>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{trendsData.total_appointments}</div>
                <div className="text-sm text-blue-600">Total Appointments</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {trendsData.urgency_distribution.find(u => u.urgency === 'routine')?.count || 0}
                </div>
                <div className="text-sm text-green-600">Routine Cases</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {trendsData.urgency_distribution.find(u => u.urgency === 'moderate')?.count || 0}
                </div>
                <div className="text-sm text-yellow-600">Moderate Cases</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {trendsData.urgency_distribution.find(u => u.urgency === 'urgent')?.count || 0}
                </div>
                <div className="text-sm text-red-600">Urgent Cases</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Urgency Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Distribution</h3>
                <div className="space-y-3">
                  {trendsData.urgency_distribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">{item.urgency}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.urgency === 'urgent' ? 'bg-red-500' :
                              item.urgency === 'moderate' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ 
                              width: `${(parseInt(item.count) / trendsData.total_appointments) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(item.urgency)}`}>
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* No-Show Risk Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">No-Show Risk Distribution</h3>
                <div className="space-y-3">
                  {trendsData.noshow_risk_distribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.risk_category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.risk_category === 'high_risk' ? 'bg-red-500' :
                              item.risk_category === 'medium_risk' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ 
                              width: `${(parseInt(item.count) / trendsData.total_appointments) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(item.risk_category)}`}>
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Trends */}
            <div className="mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trends (Last 7 Days)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trendsData.daily_trends.map((trend, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(trend.appointment_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(trend.urgency)}`}>
                              {trend.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trend.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Most Common Urgency</h4>
                  <p className="text-sm text-gray-600">
                    {trendsData.urgency_distribution.length > 0 
                      ? trendsData.urgency_distribution.reduce((max, item) => 
                          parseInt(item.count) > parseInt(max.count) ? item : max
                        ).urgency
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">High Risk Appointments</h4>
                  <p className="text-sm text-gray-600">
                    {trendsData.noshow_risk_distribution.find(r => r.risk_category === 'high_risk')?.count || 0}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                  <p className="text-sm text-gray-600">
                    {trendsData.total_appointments > 0 ? 'Active' : 'No Data'}
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
