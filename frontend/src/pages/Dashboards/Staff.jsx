import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Staff Dashboard Component
 * Shows urgent cases and alerts preview
 */
export default function StaffDashboard() {
  const { t } = useTranslation();
  const [urgentCases, setUrgentCases] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [urgentRes, alertsRes, appointmentsRes] = await Promise.all([
        API.get('/analytics/urgent-cases'),
        API.get('/analytics/alerts'),
        API.get('/appointments/today')
      ]);
      
      setUrgentCases(urgentRes.data);
      setAlerts(alertsRes.data);
      setTodayAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setUrgentCases([
        { id: 1, patient: 'John Doe', urgency: 'high', reason: 'Chest pain' },
        { id: 2, patient: 'Jane Smith', urgency: 'medium', reason: 'Fever' }
      ]);
      setAlerts([
        { id: 1, type: 'warning', message: 'High patient volume today' },
        { id: 2, type: 'info', message: 'System maintenance scheduled' }
      ]);
      setTodayAppointments([
        { id: 1, patient: 'Alice Johnson', time: '9:00 AM', doctor: 'Dr. Smith' },
        { id: 2, patient: 'Bob Wilson', time: '10:30 AM', doctor: 'Dr. Brown' }
      ]);
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
            {t('dashboard.staff.title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent Cases */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4">
                {t('dashboard.staff.urgentCases')}
              </h2>
              
              <div className="space-y-3">
                {urgentCases.map((case_) => (
                  <div key={case_.id} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-medium text-gray-900">{case_.patient}</p>
                    <p className="text-sm text-gray-600">{case_.reason}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      case_.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {case_.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Preview */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-900 mb-4">
                {t('dashboard.staff.alertsPreview')}
              </h2>
              
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                {t('dashboard.staff.todayAppointments')}
              </h2>
              
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.time}</p>
                    <p className="text-sm text-gray-600">{appointment.doctor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/appointments"
              className="bg-primary-600 hover:bg-primary-700 text-white text-center py-3 px-4 rounded-md transition-colors"
            >
              {t('appointments.allAppointments')}
            </Link>
            
            <Link
              to="/analytics"
              className="bg-secondary-600 hover:bg-secondary-700 text-white text-center py-3 px-4 rounded-md transition-colors"
            >
              {t('analytics.trends')}
            </Link>
            
            <Link
              to="/profile/clinic-staff"
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