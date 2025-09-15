import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Appointment List Component
 * Shows appointments based on user role
 */
export default function AppointmentList() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = useCallback(async () => {
    try {
      // Backend returns all appointments for the user based on their role
      const response = await API.get('/appointments');
      let filteredAppointments = response.data;
      
      // Apply client-side filtering
      if (filter !== 'all') {
        filteredAppointments = response.data.filter(apt => apt.status === filter);
      }
      
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Set mock data for development
      setAppointments([
        {
          id: 1,
          date: '2024-01-15T10:00:00Z',
          status: 'scheduled',
          urgency: 'routine',
          patient_id: 1,
          staff_id: 1,
          clinic_id: 1
        },
        {
          id: 2,
          date: '2024-01-16T14:30:00Z',
          status: 'completed',
          urgency: 'moderate',
          patient_id: 1,
          staff_id: 2,
          clinic_id: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await API.delete(`/appointments/${appointmentId}`);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {role === 'patient' ? t('appointments.myAppointments') : t('appointments.allAppointments')}
            </h1>
            
            {role === 'patient' && (
              <Link
                to="/appointments/book"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                {t('appointments.bookAppointment')}
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['all', 'scheduled', 'completed', 'cancelled', 'rescheduled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    filter === status
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </nav>
          </div>

          {/* Appointments List */}
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Appointment #{appointment.id}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                          {appointment.urgency}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {new Date(appointment.date).toLocaleTimeString()}
                        </div>
                        <div>
                          <span className="font-medium">Staff ID:</span> {appointment.staff_id || 'Not assigned'}
                        </div>
                      </div>
                      
                      {appointment.no_show_risk && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">No-Show Risk:</span> {(appointment.no_show_risk * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {role === 'patient' && appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all"
                        >
                          {t('appointments.cancel')}
                        </button>
                      )}
                      
                      {role !== 'patient' && (
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-all">
                          {t('common.view')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'You have no appointments yet.' 
                  : `No ${filter} appointments found.`
                }
              </p>
              {role === 'patient' && (
                <Link
                  to="/appointments/book"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t('appointments.bookAppointment')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

