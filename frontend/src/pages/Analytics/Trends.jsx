import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Analytics Trends Component
 * Shows various charts and trends (simplified version without Chart.js)
 */
export default function AnalyticsTrends() {
  const { t } = useTranslation();
  const [trendsData, setTrendsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const fetchTrendsData = useCallback(async () => {
    try {
      const response = await API.get(`/analytics/trends?period=${selectedPeriod}`);
      setTrendsData(response.data);
    } catch (error) {
      console.error('Error fetching trends data:', error);
      // Mock data for development
      setTrendsData({
        metrics: {
          totalAppointments: 150,
          completedAppointments: 120,
          noShows: 15,
          avgNoShowRate: 10
        },
        appointmentTrends: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [20, 25, 22, 28, 30, 15, 10]
        },
        noShowRate: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [8, 12, 10, 15, 9, 5, 7]
        },
        appointmentTypes: {
          labels: ['General', 'Emergency', 'Follow-up', 'Consultation', 'Other'],
          data: [40, 15, 25, 15, 5]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchTrendsData();
  }, [fetchTrendsData]);

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
              {t('analytics.trends')} / प्रवृत्ति
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

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{trendsData.metrics?.totalAppointments || 0}</div>
              <div className="text-sm text-blue-600">Total Appointments</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{trendsData.metrics?.completedAppointments || 0}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{trendsData.metrics?.noShows || 0}</div>
              <div className="text-sm text-red-600">No-Shows</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{trendsData.metrics?.avgNoShowRate || 0}%</div>
              <div className="text-sm text-yellow-600">Avg No-Show Rate</div>
            </div>
          </div>

          {/* Simple Chart Placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
              <div className="space-y-2">
                {trendsData.appointmentTrends?.labels?.map((label, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(trendsData.appointmentTrends.data[index] / Math.max(...trendsData.appointmentTrends.data)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{trendsData.appointmentTrends.data[index]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* No-Show Rate */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">No-Show Rate by Day</h3>
              <div className="space-y-2">
                {trendsData.noShowRate?.labels?.map((label, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${trendsData.noShowRate.data[index]}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{trendsData.noShowRate.data[index]}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointment Types Distribution */}
          <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Types Distribution</h3>
              <div className="space-y-2">
                {trendsData.appointmentTypes?.labels?.map((label, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(trendsData.appointmentTypes.data[index] / Math.max(...trendsData.appointmentTypes.data)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{trendsData.appointmentTypes.data[index]}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
