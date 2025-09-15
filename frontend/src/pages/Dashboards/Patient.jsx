import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Patient Dashboard Component
 * Shows next appointment and quick actions
 */
export default function PatientDashboard() {
  const { t } = useTranslation();
  const [nextAppointment, setNextAppointment] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get all appointments and find the next one
      const appointmentsRes = await API.get('/appointments');
      const appointments = appointmentsRes.data;
      
      // Find next upcoming appointment
      const now = new Date();
      const upcomingAppointments = appointments
        .filter(apt => new Date(apt.date) > now && apt.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setNextAppointment(upcomingAppointments[0] || null);
      
      // Use recent appointments as activity
      const recentAppointments = appointments
        .filter(apt => new Date(apt.date) <= now)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentActivity(recentAppointments.map(apt => ({
        id: apt.id,
        type: 'appointment',
        date: apt.date,
        description: `Appointment with ${apt.staff_id || 'Doctor'} - ${apt.status}`
      })));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setNextAppointment({
        id: 1,
        date: '2024-01-15',
        time: '10:00 AM',
        staff_id: 1,
        urgency: 'routine'
      });
      setRecentActivity([
        { id: 1, type: 'appointment', date: '2024-01-10', description: 'Completed appointment with Dr. Johnson' },
        { id: 2, type: 'appointment', date: '2024-01-08', description: 'Completed appointment with Dr. Smith' }
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
            {t('dashboard.patient.title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Next Appointment */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                {t('dashboard.patient.nextAppointment')}
              </h2>
              
              {nextAppointment ? (
                <div className="space-y-2">
                  <p className="text-blue-800">
                    <span className="font-medium">Date:</span> {new Date(nextAppointment.date).toLocaleDateString()}
                  </p>
                  <p className="text-blue-800">
                    <span className="font-medium">Time:</span> {new Date(nextAppointment.date).toLocaleTimeString()}
                  </p>
                  <p className="text-blue-800">
                    <span className="font-medium">Urgency:</span> {nextAppointment.urgency || 'routine'}
                  </p>
                  <p className="text-blue-800">
                    <span className="font-medium">Status:</span> {nextAppointment.status}
                  </p>
                </div>
              ) : (
                <p className="text-blue-600">No upcoming appointments</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <Link
                  to="/appointments/book"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                >
                  {t('dashboard.patient.quickBook')}
                </Link>
                
                <Link
                  to="/appointments"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                >
                  {t('appointments.myAppointments')}
                </Link>
                
                <Link
                  to="/profile/patient"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                >
                  {t('profile.myProfile')}
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.patient.recentActivity')}
            </h2>
            
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}