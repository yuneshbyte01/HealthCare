import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * AI Recommendation Component
 * Provides AI-powered appointment recommendations
 */
export default function AppointmentRecommend() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation(null);
    setMessage('');

    try {
      const response = await API.post('/appointments/recommend', {
        patient_id: user?.id,
        symptoms: symptoms
      });
      
      setRecommendation(response.data);
      setMessage('AI recommendation generated successfully!');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setMessage('Failed to generate AI recommendation');
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
              {t('appointments.recommend')}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please describe your symptoms in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-all disabled:opacity-50"
              >
                {loading ? t('common.loading') : 'Get AI Recommendations'}
              </button>
            </form>

            {recommendation && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Recommendations
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Recommended Time Slot</h3>
                    <p className="text-blue-800">
                      {new Date(recommendation.recommended_slot).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Urgency Level</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      recommendation.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                      recommendation.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {recommendation.urgency}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">AI Reasoning</h3>
                  <p className="text-yellow-800">{recommendation.reasoning}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Confidence</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          recommendation.ai_confidence === 'high' ? 'bg-green-600' :
                          recommendation.ai_confidence === 'medium' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ 
                          width: recommendation.ai_confidence === 'high' ? '90%' :
                                 recommendation.ai_confidence === 'medium' ? '60%' : '30%'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 capitalize">
                      {recommendation.ai_confidence} confidence
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Review the recommended time slot</li>
                    <li>• Book the appointment if the time works for you</li>
                    <li>• Contact the clinic if you need to reschedule</li>
                    <li>• Prepare for your appointment based on urgency level</li>
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

