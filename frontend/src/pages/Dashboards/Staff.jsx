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
    myAppointments: [],
    systemStats: {
      totalAppointments: 0,
      completedToday: 0,
      pendingToday: 0,
      urgentCases: 0,
      myAppointmentsToday: 0,
      myCompletedToday: 0
    },
    recentActivity: [],
    profileComplete: false
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
      const [urgentRes, alertsRes, appointmentsRes, myAppointmentsRes, statsRes, profileRes] = await Promise.all([
        API.get('/analytics/urgent-cases').catch(() => ({ data: [] })),
        API.get('/analytics/alerts').catch(() => ({ data: [] })),
        API.get('/appointments/today').catch(() => ({ data: [] })),
        API.get('/appointments').catch(() => ({ data: [] })),
        API.get('/analytics/system-stats').catch(() => ({ data: {} })),
        API.get('/profile/clinic-staff/me').catch(() => ({ data: null }))
      ]);
      
      const urgentCases = urgentRes.data || [];
      const alerts = alertsRes.data || [];
      const todayAppointments = appointmentsRes.data || [];
      const myAppointments = myAppointmentsRes.data || [];
      const systemStats = statsRes.data || {};
      const profile = profileRes.data;
      
      // Calculate today's statistics
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;
      const pendingToday = todayAppointments.filter(apt => 
        apt.status === 'scheduled' || apt.status === 'confirmed'
      ).length;
      
      // Calculate my appointments for today
      const myAppointmentsToday = myAppointments.filter(apt => 
        new Date(apt.date).toISOString().split('T')[0] === today
      ).length;
      const myCompletedToday = myAppointments.filter(apt => 
        new Date(apt.date).toISOString().split('T')[0] === today && apt.status === 'completed'
      ).length;
      
      // Get recent appointments (last 5)
      const recentAppointments = myAppointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setDashboardData({
        urgentCases,
        alerts,
        todayAppointments,
        myAppointments,
        systemStats: {
          totalAppointments: systemStats.totalAppointments || 0,
          completedToday,
          pendingToday,
          urgentCases: urgentCases.length,
          activeUsers: systemStats.activeUsers || 0,
          myAppointmentsToday,
          myCompletedToday
        },
        recentActivity: recentAppointments,
        profileComplete: !!profile
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(t('errors.unexpectedError'));
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

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'urgent': return t('appointments.urgent');
      case 'moderate': return t('appointments.medium');
      case 'routine': return t('appointments.low');
      default: return urgency;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return t('appointments.completed');
      case 'cancelled': return t('appointments.cancelled');
      case 'scheduled': return t('appointments.scheduled');
      case 'confirmed': return t('appointments.confirmed');
      case 'pending': return t('appointments.pending');
      default: return status;
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
                {t('dashboard.staff.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('common.greeting', { name: user?.name || t('roles.clinic_staff') })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!dashboardData.profileComplete && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-yellow-800">
                    {t('profile.completeProfileFirst')}
                  </p>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {refreshing ? t('common.loading') : t('common.refresh', 'Refresh')}
              </button>
            </div>
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
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.staff.myAppointmentsToday')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.myAppointmentsToday}
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
              <p className="text-sm font-medium text-gray-500">{t('dashboard.staff.myCompletedToday')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.myCompletedToday}
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
              <p className="text-sm font-medium text-gray-500">{t('dashboard.staff.urgentCases')}</p>
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
                <span className="text-purple-600 text-xl">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.staff.completionRate')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.systemStats.myAppointmentsToday > 0 
                  ? Math.round((dashboardData.systemStats.myCompletedToday / dashboardData.systemStats.myAppointmentsToday) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Next Appointment */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.staff.myNextAppointment')}
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.slice(0, 1).map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()} at{' '}
                        {new Date(appointment.date).toLocaleTimeString()}
                      </p>
                      {appointment.urgency && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                          {getUrgencyText(appointment.urgency)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t('appointments.patient')}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {appointment.patient_name || t('appointments.patient')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t('appointments.status')}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      {appointment.symptoms && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{t('appointments.symptoms')}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {appointment.symptoms.substring(0, 50)}...
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t">
                      <Link
                        to="/appointments"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {t('appointments.viewAll', 'View All Appointments')} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-500">{t('dashboard.staff.noUpcomingAppointments')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Urgent Cases */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.staff.urgentCases')}
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
                        {getUrgencyText(case_.urgency)}
                      </span>
                      {case_.phone && (
                        <a href={`tel:${case_.phone}`} className="text-blue-600 hover:text-blue-700 text-sm">
                          {t('common.call')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-500">{t('dashboard.staff.noUrgentCases')}</p>
              </div>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.staff.systemAlerts')}
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
                <p className="text-gray-500">{t('dashboard.staff.noAlerts')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.staff.quickActions')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/appointments"
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-blue-900">{t('appointments.allAppointments')}</div>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-green-900">{t('analytics.title')}</div>
              </div>
            </Link>
            
            <Link
              to="/appointments/sync"
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-medium text-purple-900">{t('sync.title')}</div>
              </div>
            </Link>
            
            <Link
              to="/profile/clinic-staff"
              className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="font-medium text-indigo-900">{t('profile.myProfile')}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.staff.recentActivity')}</h2>
            <Link
              to="/appointments"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('common.view')} {t('appointments.allAppointments')} →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivity.map((appointment) => (
                <div key={appointment.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">📅</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {appointment.patient_name || t('appointments.patient')} - {appointment.clinic_name || t('appointments.clinic')}
                    </p>
                    {appointment.urgency && (
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getUrgencyColor(appointment.urgency)}`}>
                        {getUrgencyText(appointment.urgency)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-500">{t('appointments.noAppointments')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('dashboard.staff.noRecentActivity')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
