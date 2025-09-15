import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Admin Dashboard Component
 * Shows system stats and AI retrain status
 */
export default function AdminDashboard() {
  const { t } = useTranslation();
  const [systemStats, setSystemStats] = useState({});
  const [aiStatus, setAiStatus] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, aiRes, performanceRes] = await Promise.all([
        API.get('/analytics/system-stats'),
        API.get('/ai/status'),
        API.get('/analytics/performance')
      ]);
      
      setSystemStats(statsRes.data);
      setAiStatus(aiRes.data);
      setPerformanceData(performanceRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setSystemStats({
        totalUsers: 150,
        totalAppointments: 45,
        systemHealth: 'Good',
        activeUsers: 23
      });
      setAiStatus({
        triageModel: { accuracy: 0.92, lastTrained: '2024-01-10' },
        noShowModel: { accuracy: 0.87, lastTrained: '2024-01-08' }
      });
      setPerformanceData({
        responseTime: 120,
        cpuUsage: 45,
        memoryUsage: 67
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('dashboard.admin.title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Statistics */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                {t('dashboard.admin.systemStats')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-800">Total Users:</span>
                  <span className="font-medium text-blue-900">{systemStats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Total Appointments:</span>
                  <span className="font-medium text-blue-900">{systemStats.totalAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">System Health:</span>
                  <span className="font-medium text-green-600">{systemStats.systemHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Active Users:</span>
                  <span className="font-medium text-blue-900">{systemStats.activeUsers}</span>
                </div>
              </div>
            </div>

            {/* AI Status */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                {t('dashboard.admin.aiRetrainStatus')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-green-800">Triage Model</h3>
                  <p className="text-sm text-green-700">Accuracy: {(aiStatus.triageModel?.accuracy * 100).toFixed(1)}%</p>
                  <p className="text-sm text-green-700">Last Trained: {new Date(aiStatus.triageModel?.lastTrained).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-green-800">No-Show Model</h3>
                  <p className="text-sm text-green-700">Accuracy: {(aiStatus.noShowModel?.accuracy * 100).toFixed(1)}%</p>
                  <p className="text-sm text-green-700">Last Trained: {new Date(aiStatus.noShowModel?.lastTrained).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">
                {t('dashboard.admin.performanceSnapshot')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-800">Response Time:</span>
                  <span className="font-medium text-purple-900">{performanceData.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">CPU Usage:</span>
                  <span className="font-medium text-purple-900">{performanceData.cpuUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Memory Usage:</span>
                  <span className="font-medium text-purple-900">{performanceData.memoryUsage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/appointments"
              className="bg-primary-600 hover:bg-primary-700 text-white text-center py-3 px-4 rounded-md transition-colors"
            >
              {t('appointments.allAppointments')}
            </Link>
            
            <Link
              to="/ai"
              className="bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-md transition-colors"
            >
              {t('ai.management')}
            </Link>
            
            <Link
              to="/analytics"
              className="bg-secondary-600 hover:bg-secondary-700 text-white text-center py-3 px-4 rounded-md transition-colors"
            >
              {t('analytics.trends')}
            </Link>
            
            <Link
              to="/profile/admin"
              className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-md transition-colors"
            >
              {t('profile.myProfile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}