import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Book Appointment Component
 * Allows patients to book new appointments with AI integration
 */
export default function BookAppointment() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    staff_id: '',
    clinic_id: '',
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [errors, setErrors] = useState({});

  // Check if user is authenticated and has patient role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'patient') {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.date = 'Please select a future date and time';
      }
    }
    
    if (!formData.symptoms.trim()) {
      newErrors.symptoms = 'Symptoms are required';
    }
    
    if (formData.staff_id && isNaN(formData.staff_id)) {
      newErrors.staff_id = 'Staff ID must be a number';
    }
    
    if (formData.clinic_id && isNaN(formData.clinic_id)) {
      newErrors.clinic_id = 'Clinic ID must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setAiResults(null);

    try {
      console.log('=== FRONTEND BOOKING DEBUG ===');
      console.log('Form data before sending:', formData);
      console.log('Symptoms from form:', formData.symptoms);
      console.log('Symptoms type:', typeof formData.symptoms);
      console.log('Symptoms length:', formData.symptoms ? formData.symptoms.length : 'null/undefined');

      // Prepare data for API
      const appointmentData = {
        date: formData.date,
        symptoms: formData.symptoms,
        ...(formData.staff_id && { staff_id: parseInt(formData.staff_id) }),
        ...(formData.clinic_id && { clinic_id: parseInt(formData.clinic_id) })
      };
      
      console.log('Sending to API:', appointmentData);
      console.log('Symptoms in API data:', appointmentData.symptoms);
      
      const response = await API.post('/appointments', appointmentData);
      
      console.log('API Response:', response.data);
      
      // The backend returns the appointment with AI results
      const appointment = response.data;
      setAiResults({
        urgency: appointment.urgency,
        noShowRisk: appointment.no_show_risk
      });
      
      setMessage('Appointment booked successfully! Redirecting to appointments...');
      
      // Redirect to appointments list after a delay
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to book appointment';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - please check your connection';
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
        console.error('Other error:', error);
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testAI = async () => {
    if (!formData.symptoms.trim()) {
      setMessage('Please enter symptoms to test AI');
      return;
    }

    try {
      const response = await API.post('/appointments/test-ai', {
        symptoms: formData.symptoms,
        patient_id: user?.id,
        date: formData.date
      });
      
      setAiResults(response.data);
      setMessage('AI analysis completed!');
    } catch (error) {
      console.error('Error testing AI:', error);
      setMessage('AI service temporarily unavailable');
    }
  };

  // Show loading if checking authentication
  if (!isAuthenticated || user?.role !== 'patient') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">
              {t('appointments.bookAppointment')}
            </h1>
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('appointments.date')} *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff ID
                  </label>
                  <input
                    type="number"
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.staff_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Staff member ID (optional)"
                  />
                  {errors.staff_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.staff_id}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic ID
                </label>
                <input
                  type="number"
                  name="clinic_id"
                  value={formData.clinic_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.clinic_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Clinic ID (optional)"
                />
                {errors.clinic_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.clinic_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms / Reason for Visit *
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows={4}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.symptoms ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your symptoms or reason for the visit..."
                />
                {errors.symptoms && (
                  <p className="mt-1 text-sm text-red-600">{errors.symptoms}</p>
                )}
              </div>

              {/* AI Test Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  AI Analysis
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  Test AI triage and no-show prediction before booking
                </p>
                <button
                  type="button"
                  onClick={testAI}
                  disabled={!formData.symptoms.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test AI Analysis
                </button>
              </div>

              {/* AI Results Display */}
              {aiResults && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    AI Analysis Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-gray-900 mb-1">Triage Assessment</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Urgency:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          aiResults.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                          aiResults.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {aiResults.urgency}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-gray-900 mb-1">No-Show Risk</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Risk:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          aiResults.noShowRisk > 0.6 ? 'bg-red-100 text-red-800' :
                          aiResults.noShowRisk > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(aiResults.noShowRisk * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/appointments')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    t('appointments.book')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}