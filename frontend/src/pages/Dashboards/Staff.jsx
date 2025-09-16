import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Enhanced Staff Dashboard Component
 * Shows comprehensive staff information and clinic management
 */
export default function StaffDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    urgentCases: [],
    alerts: [],
    todayAppointments: [],
    systemStats: {
      totalAppointments: 0,
      completedToday: 0,
      pendingToday: 0,
      urgentCases: 0
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const [urgentRes, alertsRes, appointmentsRes, statsRes] = await Promise.all([
        API.get('/analytics/urgent-cases').catch(() => ({ data: [] })),
        API.get('/analytics/alerts').catch(() => ({ data: [] })),
        API.get('/appointments/today').catch(() => ({ data: [] })),
        API.get('/analytics/system-stats').catch(() => ({ data: {} }))
      ]);
      
      const urgentCases = urgentRes.data || [];
      const alerts = alertsRes.data || [];
      const todayAppointments = appointmentsRes.data || [];
      const systemStats = statsRes.data || {};
      
      // Calculate today's statistics
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;
      const pendingToday = todayAppointments.filter(apt => 
        apt.status === 'scheduled' || apt.status === 'confirmed'
      ).length;
      
      setDashboardData({
        urgentCases,
        alerts,
        todayAppointments,
        systemStats: {
          totalAppointments: systemStats.totalAppointments || 0,
          completedToday,
          pendingToday,
          urgentCases: urgentCases.length,
          activeUsers: systemStats.activeUsers || 0
        },
        recentActivity: todayAppointments.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
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
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Staff Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || 'Staff'}!
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.todayAppointments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">🚨</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent Cases</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.urgentCases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👨‍⚕️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.activeUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Cases */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Urgent Cases
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.urgentCases.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.urgentCases.map((case_) => (
                  <div key={case_.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{case_.patient}</p>
                      <span className="text-sm text-gray-500">{case_.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{case_.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(case_.urgency)}`}>
                        {case_.urgency}
                      </span>
                      {case_.phone && (
                        <a href={`tel:${case_.phone}`} className="text-blue-600 hover:text-blue-700 text-sm">
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-500">No urgent cases</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              System Alerts
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.alerts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
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

        {/* Today's Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Appointments
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                      <span className="text-sm text-gray-500">{appointment.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{appointment.staff_name}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {appointment.urgency && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                          {appointment.urgency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-500">No appointments today</p>
              </div>
            )}
          </div>
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
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-blue-900">All Appointments</div>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-green-900">Analytics</div>
              </div>
            </Link>
            
            <Link
              to="/appointments/sync"
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-medium text-purple-900">Sync Data</div>
              </div>
            </Link>
            
            <Link
              to="/profile/clinic-staff"
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
                  <span className="text-green-600">✅</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Appointment completed</p>
                <p className="text-sm text-gray-500">Patient: John Doe - 2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">🚨</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Urgent case identified</p>
                <p className="text-sm text-gray-500">Patient: Jane Smith - 3 hours ago</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📊</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Analytics report generated</p>
                <p className="text-sm text-gray-500">Daily summary - 4 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
