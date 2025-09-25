import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Appointment List Component
 * Shows appointments based on user role with AI insights
 */
export default function AppointmentList() {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await API.get('/appointments');
      let filteredAppointments = response.data;
      
      // Apply client-side filtering
      if (filter !== 'all') {
        filteredAppointments = response.data.filter(apt => apt.status === filter);
      }
      
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage(t('errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(t('appointments.confirmCancel', 'Are you sure you want to cancel this appointment?'))) {
      return;
    }

    try {
      await API.delete(`/appointments/${appointmentId}`);
      setMessage(t('appointments.appointmentCancelled'));
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setMessage(t('errors.unexpectedError'));
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!newDate) {
      setMessage(t('appointments.dateRequired', 'Please select a new date and time'));
      return;
    }

    setRescheduleLoading(true);
    try {
      await API.put(`/appointments/${selectedAppointment.id}`, { 
        date: newDate
      });
      setMessage(t('appointments.appointmentRescheduled', 'Appointment rescheduled successfully'));
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setNewDate('');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setMessage(t('errors.unexpectedError'));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    // Set current appointment date as default
    if (appointment?.date) {
      const currentDate = new Date(appointment.date);
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const formattedDate = currentDate.toISOString().slice(0, 16);
      setNewDate(formattedDate);
    }
    setShowRescheduleModal(true);
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

  const getNoShowRiskColor = (risk) => {
    if (risk > 0.6) return 'bg-red-100 text-red-800';
    if (risk > 0.3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (status) => {
    return t(`appointments.${status}`);
  };

  const getUrgencyText = (urgency) => {
    return t(`appointments.${urgency}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {role === 'patient' ? t('appointments.myAppointments') : t('appointments.allAppointments')}
              </h1>
              
              {role === 'patient' && (
                <Link
                  to="/appointments/book"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-all"
                >
                  {t('appointments.bookAppointment')}
                </Link>
              )}
            </div>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.includes('success') || message.includes('updated') || message.includes('cancelled') || message.includes('rescheduled')
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Filter Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                      filter === status
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {status === 'all' ? t('common.all', 'All') : getStatusText(status)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Appointments List */}
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t('appointments.appointment')} #{appointment.id}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                            {getUrgencyText(appointment.urgency)}
                          </span>
                          {/* Show rescheduled indicator if appointment was updated after creation */}
                          {appointment.last_updated && appointment.created_at && 
                           new Date(appointment.last_updated) > new Date(appointment.created_at) && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {t('appointments.rescheduled', 'Rescheduled')}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">{t('appointments.date')}:</span> {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">{t('appointments.time')}:</span> {new Date(appointment.date).toLocaleTimeString()}
                          </div>
                          <div>
                            <span className="font-medium">{t('appointments.staff')}:</span> {appointment.staff_name || appointment.staff_id || t('appointments.notAssigned', 'Not assigned')}
                          </div>
                        </div>
                        
                        {/* AI Insights */}
                        <div className="flex flex-wrap gap-2">
                          {appointment.urgency && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                              <span className="text-xs font-medium text-blue-800">{t('ai.title')} {t('appointments.urgencyLevel')}: </span>
                              <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(appointment.urgency)}`}>
                                {getUrgencyText(appointment.urgency)}
                              </span>
                            </div>
                          )}
                          
                          {appointment.no_show_risk && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                              <span className="text-xs font-medium text-purple-800">{t('analytics.noShowRate')}: </span>
                              <span className={`text-xs px-2 py-1 rounded ${getNoShowRiskColor(appointment.no_show_risk)}`}>
                                {(appointment.no_show_risk * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {/* View Button - Always visible */}
                        <Link
                          to={`/appointments/${appointment.id}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-all"
                        >
                          {t('common.view')}
                        </Link>

                        {/* Role-specific actions */}
                        {role === 'patient' && (appointment.status === 'scheduled' || appointment.status === 'rescheduled') && (
                          <>
                            <button
                              onClick={() => openRescheduleModal(appointment)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-all"
                            >
                              {t('appointments.reschedule')}
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all"
                            >
                              {t('appointments.cancel')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('appointments.noAppointments')}</h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? t('appointments.noAppointmentsYet', 'You have no appointments yet.') 
                    : t('appointments.noFilteredAppointments', `No ${getStatusText(filter)} appointments found.`)
                  }
                </p>
                {role === 'patient' && (
                  <Link
                    to="/appointments/book"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {t('appointments.bookAppointment')}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('appointments.rescheduleAppointment', 'Reschedule Appointment')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('appointments.appointment')} #{selectedAppointment.id}
              </p>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('appointments.currentDate', 'Current Date & Time')}
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {new Date(selectedAppointment.date).toLocaleString()}
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('appointments.newDate', 'New Date & Time')} *
                </label>
                <input
                  type="datetime-local"
                  id="newDate"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('appointments.selectFutureDate', 'Please select a future date and time')}
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setNewDate('');
                }}
                disabled={rescheduleLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleRescheduleAppointment}
                disabled={rescheduleLoading || !newDate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {rescheduleLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t('appointments.reschedule', 'Reschedule')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

