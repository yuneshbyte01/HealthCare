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
    recentActivity: [],
    clinicStaff: [],
    profileComplete: false
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, aiRes, performanceRes, alertsRes, clinicStaffRes, profileRes] = await Promise.all([
        API.get('/analytics/system-stats').catch(() => ({ data: {} })),
        API.get('/ai/status').catch(() => ({ data: {} })),
        API.get('/analytics/performance').catch(() => ({ data: {} })),
        API.get('/analytics/alerts').catch(() => ({ data: [] })),
        API.get('/profile/clinic-staff/all').catch(() => ({ data: [] })),
        API.get('/profile/admin/me').catch(() => ({ data: null }))
      ]);
      
      const systemStats = statsRes.data || {};
      const aiStatus = aiRes.data || {};
      const performanceData = performanceRes.data || {};
      const alerts = alertsRes.data || [];
      const clinicStaff = clinicStaffRes.data || [];
      const profile = profileRes.data;
      
      // Calculate additional stats
      const totalStaff = clinicStaff.length;
      const activeStaff = clinicStaff.filter(staff => staff.experience_years > 0).length;
      
      setDashboardData({
        systemStats: {
          ...systemStats,
          totalStaff,
          activeStaff
        },
        aiStatus,
        performanceData,
        alerts,
        clinicStaff,
        recentActivity: [],
        profileComplete: !!profile
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setDashboardData({
        systemStats: {
          totalUsers: 0,
          totalAppointments: 0,
          systemHealth: 'Unknown',
          activeUsers: 0,
          totalClinics: 0,
          totalStaff: 0,
          activeStaff: 0
        },
        aiStatus: {
          triageModel: { accuracy: 0, lastTrained: 'Unknown', status: 'unknown' },
          noShowModel: { accuracy: 0, lastTrained: 'Unknown', status: 'unknown' },
          overallStatus: 'unknown'
        },
        performanceData: {
          responseTime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          uptime: 'Unknown'
        },
        alerts: [],
        clinicStaff: [],
        recentActivity: [],
        profileComplete: false
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
                {t('common.greeting', { name: user?.name || t('roles.admin') })}
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

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.admin.totalUsers')}</p>
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
                <span className="text-green-600 text-xl">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.admin.totalAppointments')}</p>
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
                <span className="text-purple-600 text-xl">🏥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.admin.activeClinics')}</p>
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
              <p className="text-sm font-medium text-gray-500">{t('dashboard.admin.staffMembers')}</p>
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
                <span className="text-gray-600">{t('dashboard.admin.systemHealth')}</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  dashboardData.systemStats.systemHealth === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardData.systemStats.systemHealth || t('common.unknown')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.admin.activeUsers')}</span>
                <span className="font-medium text-gray-900">
                  {dashboardData.systemStats.activeUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.admin.uptime')}</span>
                <span className="font-medium text-gray-900">
                  {dashboardData.performanceData.uptime || '99.9%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.admin.responseTime')}</span>
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
                <span className="text-gray-600">{t('dashboard.admin.overallStatus')}</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  dashboardData.aiStatus.overallStatus === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardData.aiStatus.overallStatus || t('common.unknown')}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">{t('dashboard.admin.triageModel')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('dashboard.admin.accuracy')}</span>
                    <span className="font-medium">
                      {((dashboardData.aiStatus.triageModel?.accuracy || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('dashboard.admin.lastTrained')}</span>
                    <span className="font-medium">
                      {dashboardData.aiStatus.triageModel?.lastTrained ? 
                        new Date(dashboardData.aiStatus.triageModel.lastTrained).toLocaleDateString() : 
                        t('common.unknown')
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">{t('dashboard.admin.noShowModel')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('dashboard.admin.accuracy')}</span>
                    <span className="font-medium">
                      {((dashboardData.aiStatus.noShowModel?.accuracy || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('dashboard.admin.lastTrained')}</span>
                    <span className="font-medium">
                      {dashboardData.aiStatus.noShowModel?.lastTrained ? 
                        new Date(dashboardData.aiStatus.noShowModel.lastTrained).toLocaleDateString() : 
                        t('common.unknown')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Staff Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('dashboard.admin.clinicStaff')}
              </h2>
              <Link
                to="/profile/clinic-staff/all"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t('common.view')} {t('common.all')} →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.clinicStaff.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.clinicStaff.slice(0, 3).map((staff) => (
                  <div key={staff.staff_id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {staff.name?.charAt(0) || '👨‍⚕️'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                        <span className="text-xs text-gray-500">{staff.experience_years || 0}y exp</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {staff.position} - {staff.specialization || t('common.general')}
                      </p>
                    </div>
                  </div>
                ))}
                {dashboardData.clinicStaff.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      +{dashboardData.clinicStaff.length - 3} {t('dashboard.admin.moreStaff')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👨‍⚕️</div>
                <p className="text-gray-500">{t('dashboard.admin.noStaff')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('dashboard.admin.addStaffFirst')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.admin.systemAlerts')}</h2>
            <Link
              to="/analytics/alerts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('common.view')} {t('common.all')} →
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
              <p className="text-gray-500">{t('dashboard.admin.noAlerts')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.admin.quickActions')}</h2>
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
              to="/ai"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-medium text-green-900">{t('ai.title')}</div>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-purple-900">{t('analytics.title')}</div>
              </div>
            </Link>
            
            <Link
              to="/profile/admin"
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
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.admin.recentActivity')}</h2>
            <Link
              to="/analytics"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('common.view')} {t('common.all')} →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">📊</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-500">{t('dashboard.admin.noRecentActivity')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('dashboard.admin.systemQuiet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}