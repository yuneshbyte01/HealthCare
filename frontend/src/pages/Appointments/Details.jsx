import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Appointment Details Component
 * Shows detailed information about a specific appointment
 */
export default function AppointmentDetails() {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await API.get(`/appointments/${id}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      setError(t('appointments.appointmentNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(t('appointments.confirmStatusChange', `Are you sure you want to change status to ${newStatus}?`))) {
      return;
    }

    setUpdating(true);
    try {
      await API.put(`/appointments/${id}`, { status: newStatus });
      setMessage(t('appointments.appointmentUpdated'));
      fetchAppointmentDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment:', error);
      setMessage(t('errors.unexpectedError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!window.confirm(t('appointments.confirmCancel', 'Are you sure you want to cancel this appointment?'))) {
      return;
    }

    setUpdating(true);
    try {
      await API.delete(`/appointments/${id}`);
      setMessage(t('appointments.appointmentCancelled'));
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setMessage(t('errors.unexpectedError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate) {
      setMessage(t('appointments.dateRequired', 'Please select a new date and time'));
      return;
    }

    setRescheduleLoading(true);
    try {
      await API.put(`/appointments/${id}`, { 
        date: newDate
      });
      setMessage(t('appointments.appointmentRescheduled', 'Appointment rescheduled successfully'));
      setShowRescheduleModal(false);
      setNewDate('');
      fetchAppointmentDetails(); // Refresh data
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setMessage(t('errors.unexpectedError'));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const openRescheduleModal = () => {
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

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error || t('appointments.appointmentNotFound')}</h3>
          <Link
            to="/appointments"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('common.back')} {t('appointments.appointments')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-4 bg-blue-600">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {t('appointments.appointmentDetails')} #{appointment.id}
              </h1>
              <Link
                to="/appointments"
                className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                ← {t('common.back')}
              </Link>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success') || message.includes('updated') || message.includes('cancelled')
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments.basicInfo', 'Basic Information')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('appointments.date')}</label>
                  <p className="text-lg text-gray-900">{new Date(appointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('appointments.time')}</label>
                  <p className="text-lg text-gray-900">{new Date(appointment.date).toLocaleTimeString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('appointments.status')}</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {t(`appointments.${appointment.status}`)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('appointments.urgencyLevel')}</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                    {t(`appointments.${appointment.urgency}`)}
                  </span>
                </div>
                {/* Show rescheduled indicator if appointment was updated after creation */}
                {appointment.last_updated && appointment.created_at && 
                 new Date(appointment.last_updated) > new Date(appointment.created_at) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('appointments.rescheduleStatus', 'Reschedule Status')}</label>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {t('appointments.rescheduled', 'Rescheduled')}
                    </span>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('appointments.staff')}</label>
                  <p className="text-lg text-gray-900">{appointment.staff_name || appointment.staff_id || t('appointments.notAssigned', 'Not assigned')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('appointments.clinic')}</label>
                  <p className="text-lg text-gray-900">{appointment.clinic_name || appointment.clinic_id || t('appointments.notAssigned', 'Not assigned')}</p>
                </div>
                {/* Add Symptoms field */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">{t('appointments.symptoms')}</label>
                  <p className="text-lg text-gray-900 mt-1">
                    {appointment.symptoms || t('appointments.noSymptoms', 'No symptoms reported')}
                  </p>
                </div>
              </div>
            </div>

            {/* Symptoms and Notes */}
            {(appointment.symptoms || appointment.notes) && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments.medicalInfo', 'Medical Information')}</h2>
                {appointment.symptoms && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500">{t('appointments.symptoms')}</label>
                    <p className="text-gray-900 mt-1">{appointment.symptoms}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('appointments.notes')}</label>
                    <p className="text-gray-900 mt-1">{appointment.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Patient Information (for staff/admin) */}
            {(role === 'clinic_staff' || role === 'admin') && appointment.patient_name && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments.patientInfo', 'Patient Information')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('common.name')}</label>
                    <p className="text-lg text-gray-900">{appointment.patient_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('common.email')}</label>
                    <p className="text-lg text-gray-900">{appointment.patient_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('common.phone')}</label>
                    <p className="text-lg text-gray-900">{appointment.patient_phone || t('common.notProvided', 'Not provided')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('ai.title')} {t('analytics.insights', 'Insights')}</h2>
              <div className="space-y-4">
                {appointment.urgency && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">{t('appointments.urgencyLevel')}</h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                      {t(`appointments.${appointment.urgency}`)}
                    </span>
                  </div>
                )}
                
                {appointment.no_show_risk && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-purple-800 mb-2">{t('analytics.noShowRate')}</h3>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getNoShowRiskColor(appointment.no_show_risk)}`}>
                      {(appointment.no_show_risk * 100).toFixed(1)}%
                    </span>
                  </div>
                )}

                {appointment.ai_recommendation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800 mb-2">{t('appointments.recommendation')}</h3>
                    <p className="text-sm text-green-700">{appointment.ai_recommendation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.actions', 'Actions')}</h2>
              <div className="space-y-3">
                {(role === 'clinic_staff' || role === 'admin') && (appointment.status === 'scheduled' || appointment.status === 'rescheduled') && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {t('appointments.markCompleted', 'Mark as Completed')}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updating}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {t('appointments.markCancelled', 'Mark as Cancelled')}
                    </button>
                  </>
                )}

                {role === 'patient' && (appointment.status === 'scheduled' || appointment.status === 'rescheduled') && (
                  <>
                    <button
                      onClick={handleCancelAppointment}
                      disabled={updating}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {t('appointments.cancel')}
                    </button>
                    <button
                      onClick={openRescheduleModal}
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {t('appointments.reschedule')}
                    </button>
                  </>
                )}

                <Link
                  to="/appointments"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center block"
                >
                  {t('common.back')} {t('appointments.appointments')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('appointments.rescheduleAppointment', 'Reschedule Appointment')}
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('appointments.currentDate', 'Current Date & Time')}
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {appointment && new Date(appointment.date).toLocaleString()}
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
                  setNewDate('');
                }}
                disabled={rescheduleLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleReschedule}
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
