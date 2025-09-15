import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * Test AI Component
 * Allows testing of AI models
 */
export default function TestAI() {
  const { t } = useTranslation();
  const [testData, setTestData] = useState({
    symptoms: '',
    medicalHistory: '',
    age: '',
    gender: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

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

    try {
      const response = await API.post('/ai/test', testData);
      setResults(response.data);
    } catch (error) {
      console.error('Error testing AI:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('appointments.testAI')} / एआई परीक्षण
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age / उमेर
                </label>
                <input
                  type="number"
                  name="age"
                  value={testData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender / लिङ्ग
                </label>
                <select
                  name="gender"
                  value={testData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Symptoms / हालका लक्षणहरू
              </label>
              <textarea
                name="symptoms"
                value={testData.symptoms}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe current symptoms..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History / स्वास्थ्य इतिहास
              </label>
              <textarea
                name="medicalHistory"
                value={testData.medicalHistory}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any relevant medical history..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md font-medium transition-all disabled:opacity-50"
            >
              {loading ? t('common.loading') : 'Test AI Models / एआई मोडेलहरू परीक्षण गर्नुहोस्'}
            </button>
          </form>

          {results && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                AI Test Results / एआई परीक्षण परिणामहरू
              </h2>

              {/* Triage Results */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Triage Model Results</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Priority:</span> {results.triage?.priority}</p>
                  <p><span className="font-medium">Recommended Action:</span> {results.triage?.action}</p>
                  <p><span className="font-medium">Confidence:</span> {results.triage?.confidence}%</p>
                </div>
              </div>

              {/* No-Show Prediction */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">No-Show Prediction</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Prediction:</span> {results.noShow?.prediction}</p>
                  <p><span className="font-medium">Probability:</span> {results.noShow?.probability}%</p>
                  <p><span className="font-medium">Risk Factors:</span> {results.noShow?.riskFactors?.join(', ')}</p>
                </div>
              </div>

              {/* Model Performance */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Model Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Triage Model Accuracy:</span> {results.performance?.triageAccuracy}%</p>
                    <p><span className="font-medium">No-Show Model Accuracy:</span> {results.performance?.noShowAccuracy}%</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Processing Time:</span> {results.performance?.processingTime}ms</p>
                    <p><span className="font-medium">Model Version:</span> {results.performance?.version}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

