import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * Test AI Component
 * Allows testing of AI models for appointment booking
 */
export default function TestAI() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [testData, setTestData] = useState({
    symptoms: '',
    patient_id: '',
    date: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setTestData({
      ...testData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setMessage('');

    try {
      const response = await API.post('/appointments/test-ai', testData);
      setResults(response.data);
      setMessage('AI test completed successfully!');
    } catch (error) {
      console.error('Error testing AI:', error);
      setMessage('AI service temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">
              {t('appointments.testAI')}
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
                    Patient ID
                  </label>
                  <input
                    type="number"
                    name="patient_id"
                    value={testData.patient_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Patient ID (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={testData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={testData.symptoms}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe symptoms for AI analysis..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-all disabled:opacity-50"
              >
                {loading ? t('common.loading') : 'Test AI Models'}
              </button>
            </form>

            {results && (
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Test Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Triage Results */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Triage Assessment</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-blue-800">Urgency:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          results.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                          results.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {results.urgency}
                        </span>
                      </p>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Symptoms:</span> {results.symptoms}
                      </p>
                    </div>
                  </div>

                  {/* No-Show Prediction */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">No-Show Prediction</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-green-800">Risk Level:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          results.noShowRisk > 0.6 ? 'bg-red-100 text-red-800' :
                          results.noShowRisk > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {(results.noShowRisk * 100).toFixed(1)}%
                        </span>
                      </p>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Patient ID:</span> {results.patient_id || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Integration Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Integration Status</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Test Date:</span> {results.date || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Message:</span> {results.message}
                    </p>
                  </div>
                </div>

                {/* AI Service Information */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">AI Services Used</h3>
                  <ul className="text-purple-800 space-y-1 text-sm">
                    <li>• NLP-based Triage Service (Multilingual Support)</li>
                    <li>• ML-based No-Show Predictor</li>
                    <li>• Fallback ML Triage (if NLP unavailable)</li>
                    <li>• Real-time AI Analysis</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

