import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * AI Recommendation Component
 * Provides AI-powered appointment recommendations
 */
export default function AppointmentRecommend() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations(null);

    try {
      const response = await API.post('/appointments/recommend', {
        symptoms,
        urgency
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('appointments.recommend')} / एआई सिफारिस
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms / आफ्ना लक्षणहरू वर्णन गर्नुहोस्
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How urgent do you feel this is? / यो कति तत्काल छ भन्ने लाग्छ?
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select urgency level</option>
                <option value="low">Low - Can wait a few days / कम - केही दिन पर्खन सकिन्छ</option>
                <option value="normal">Normal - Within a week / सामान्य - एक हप्ताभित्र</option>
                <option value="high">High - Within 2-3 days / उच्च - २-३ दिनभित्र</option>
                <option value="urgent">Urgent - Today or tomorrow / तत्काल - आज वा भोलि</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-all disabled:opacity-50"
            >
              {loading ? t('common.loading') : 'Get AI Recommendations / एआई सिफारिस लिनुहोस्'}
            </button>
          </form>

          {recommendations && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                AI Recommendations / एआई सिफारिसहरू
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Recommended Doctor Type</h3>
                <p className="text-blue-800">{recommendations.doctorType}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Suggested Timeframe</h3>
                <p className="text-green-800">{recommendations.timeframe}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Additional Notes</h3>
                <p className="text-yellow-800">{recommendations.notes}</p>
              </div>

              {recommendations.confidence && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Confidence Level</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${recommendations.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{recommendations.confidence}% confidence</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

