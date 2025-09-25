import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Enhanced Patient Dashboard Component
 * Shows comprehensive patient information and health insights
 */
export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    nextAppointment: null,
    recentAppointments: [],
    healthStats: {
      totalAppointments: 0,
      completedAppointments: 0,
      upcomingAppointments: 0,
      cancelledAppointments: 0
    },
    profileComplete: false,
    healthTrends: []
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
      const [appointmentsRes, profileRes] = await Promise.all([
        API.get('/appointments'),
        API.get('/profile/patient/me').catch(() => ({ data: null }))
      ]);
      
      const appointments = appointmentsRes.data || [];
      const profile = profileRes.data;
      
      // Calculate health statistics
      const now = new Date();
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
      const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.date) > now && apt.status !== 'cancelled'
      ).length;
      const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
      
      // Find next upcoming appointment
      const nextAppointment = appointments
        .filter(apt => new Date(apt.date) > now && apt.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
      
      // Get recent appointments (last 5)
      const recentAppointments = appointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      // Calculate health trends (appointments by month)
      const healthTrends = calculateHealthTrends(appointments);
      
      setDashboardData({
        nextAppointment,
        recentAppointments,
        healthStats: {
          totalAppointments,
          completedAppointments,
          upcomingAppointments,
          cancelledAppointments
        },
        profileComplete: !!profile,
        healthTrends
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(t('errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthTrends = (appointments) => {
    const trends = {};
    appointments.forEach(apt => {
      const month = new Date(apt.date).toISOString().substring(0, 7); // YYYY-MM
      if (!trends[month]) {
        trends[month] = { total: 0, completed: 0, cancelled: 0 };
      }
      trends[month].total++;
      if (apt.status === 'completed') trends[month].completed++;
      if (apt.status === 'cancelled') trends[month].cancelled++;
    });
    
    return Object.entries(trends)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([month, data]) => ({
        month,
        ...data,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
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
      default: return 'bg-gray-100 text-gray-800';
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
            {t('dashboard.patient.title')}
          </h1>
              <p className="text-gray-600 mt-1">
                {t('common.greeting', { name: user?.name || t('roles.patient') })}
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

      {/* Health Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.patient.totalAppointments')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.healthStats.totalAppointments}
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
              <p className="text-sm font-medium text-gray-500">{t('dashboard.patient.completedAppointments')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.healthStats.completedAppointments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⏰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.patient.upcomingAppointments')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.healthStats.upcomingAppointments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('analytics.performance')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.healthStats.totalAppointments > 0 
                  ? Math.round((dashboardData.healthStats.completedAppointments / dashboardData.healthStats.totalAppointments) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.patient.nextAppointment')}
              </h2>
          </div>
          <div className="p-6">
            {dashboardData.nextAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{t('appointments.date')} & {t('appointments.time')}</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(dashboardData.nextAppointment.date).toLocaleDateString()} at{' '}
                      {new Date(dashboardData.nextAppointment.date).toLocaleTimeString()}
                    </p>
                  </div>
                  {dashboardData.nextAppointment.urgency && (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getUrgencyColor(dashboardData.nextAppointment.urgency)}`}>
                      {getUrgencyText(dashboardData.nextAppointment.urgency)}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('appointments.status')}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dashboardData.nextAppointment.status)}`}>
                      {getStatusText(dashboardData.nextAppointment.status)}
                    </span>
                  </div>
                  {dashboardData.nextAppointment.staff_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('appointments.doctor')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {dashboardData.nextAppointment.staff_name}
                      </span>
                    </div>
                  )}
                  {dashboardData.nextAppointment.clinic_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('appointments.clinic')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {dashboardData.nextAppointment.clinic_name}
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
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-500 mb-4">{t('dashboard.patient.noUpcomingAppointments')}</p>
                <Link
                  to="/appointments/book"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('appointments.bookAppointment')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Health Trends */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('analytics.trends')}
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.healthTrends.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.healthTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trend.total} {t('appointments.appointments')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {trend.completionRate}% {t('analytics.performance')}
                      </p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${trend.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-500">{t('analytics.noData', 'No trends available yet')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.patient.bookNewAppointment')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.patient.quickBook')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/appointments/book"
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-blue-900">{t('appointments.bookAppointment')}</div>
              </div>
                </Link>
                
                <Link
                  to="/appointments"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-green-900">{t('appointments.myAppointments')}</div>
              </div>
                </Link>
                
                <Link
                  to="/profile/patient"
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="font-medium text-purple-900">{t('profile.myProfile')}</div>
              </div>
                </Link>
              </div>
            </div>
          </div>

      {/* Recent Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.patient.recentActivity')}
            </h2>
            <Link
              to="/appointments"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('common.view')} {t('appointments.allAppointments')} →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {dashboardData.recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentAppointments.map((appointment) => (
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
                      {appointment.staff_name || t('appointments.doctor')} - {appointment.clinic_name || t('appointments.clinic')}
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
              <p className="text-sm text-gray-400 mt-1">{t('dashboard.patient.bookNewAppointment')}</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
