import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Enhanced Admin Dashboard Component
 * Shows system stats, AI status, and performance metrics
 */
export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    systemStats: {},
    aiStatus: {},
    performanceData: {},
    alerts: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, aiRes, performanceRes, alertsRes] = await Promise.all([
        API.get('/analytics/system-stats'),
        API.get('/ai/status'),
        API.get('/analytics/performance'),
        API.get('/analytics/alerts')
      ]);
      
      setDashboardData({
        systemStats: statsRes.data || {},
        aiStatus: aiRes.data || {},
        performanceData: performanceRes.data || {},
        alerts: alertsRes.data || [],
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setDashboardData({
        systemStats: {
          totalUsers: 150,
          totalAppointments: 45,
          systemHealth: 'Good',
          activeUsers: 23,
          totalClinics: 5,
          totalStaff: 12
        },
        aiStatus: {
          triageModel: { accuracy: 0.92, lastTrained: '2024-01-10', status: 'active' },
          noShowModel: { accuracy: 0.87, lastTrained: '2024-01-08', status: 'active' },
          overallStatus: 'operational'
        },
        performanceData: {
          responseTime: 120,
          cpuUsage: 45,
          memoryUsage: 67,
          diskUsage: 34,
          uptime: '99.9%'
        },
        alerts: [
          { id: 1, type: 'warning', message: 'High CPU usage detected', severity: 'medium' },
          { id: 2, type: 'info', message: 'AI models performing well', severity: 'low' }
        ],
        recentActivity: [
          { id: 1, type: 'ai_retrain', description: 'AI models retrained successfully', time: '2 hours ago' },
          { id: 2, type: 'user_registration', description: 'New user registered', time: '4 hours ago' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
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
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.admin.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || 'Admin'}!
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl"></span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl"></span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Appointments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.totalAppointments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl"></span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clinics</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.totalClinics || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">👨‍⚕️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Staff Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.totalStaff || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.admin.systemStats')}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">System Health</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  dashboardData.systemStats.systemHealth === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardData.systemStats.systemHealth || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-medium text-gray-900">
                  {dashboardData.systemStats.activeUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium text-gray-900">
                  {dashboardData.performanceData.uptime || '99.9%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium text-gray-900">
                  {dashboardData.performanceData.responseTime || 0}ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.admin.aiRetrainStatus')}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Overall Status</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  dashboardData.aiStatus.overallStatus === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardData.aiStatus.overallStatus || 'Unknown'}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Triage Model</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-medium">
                      {((dashboardData.aiStatus.triageModel?.accuracy || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Trained</span>
                    <span className="font-medium">
                      {dashboardData.aiStatus.triageModel?.lastTrained ? 
                        new Date(dashboardData.aiStatus.triageModel.lastTrained).toLocaleDateString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">No-Show Model</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-medium">
                      {((dashboardData.aiStatus.noShowModel?.accuracy || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Trained</span>
                    <span className="font-medium">
                      {dashboardData.aiStatus.noShowModel?.lastTrained ? 
                        new Date(dashboardData.aiStatus.noShowModel.lastTrained).toLocaleDateString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Snapshot */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.admin.performanceSnapshot')}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CPU Usage</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${dashboardData.performanceData.cpuUsage || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">
                    {dashboardData.performanceData.cpuUsage || 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Memory Usage</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${dashboardData.performanceData.memoryUsage || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">
                    {dashboardData.performanceData.memoryUsage || 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Disk Usage</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${dashboardData.performanceData.diskUsage || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-medium text-gray-900">
                    {dashboardData.performanceData.diskUsage || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
            <Link
              to="/analytics/alerts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {dashboardData.alerts.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        alert.severity === 'high' ? 'bg-red-100' :
                        alert.severity === 'medium' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <span className={`text-sm ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-500">No alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/appointments"
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2"></div>
                <div className="font-medium text-blue-900">All Appointments</div>
              </div>
            </Link>
            
            <Link
              to="/ai"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2"></div>
                <div className="font-medium text-green-900">AI Management</div>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-purple-900">Analytics</div>
              </div>
            </Link>
            
            <Link
              to="/profile/admin"
              className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="font-medium text-indigo-900">My Profile</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/analytics"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🤖</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">AI models retrained successfully</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">👤</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-sm text-gray-500">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">📊</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Analytics report generated</p>
                <p className="text-sm text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}