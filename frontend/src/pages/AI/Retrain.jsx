import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

/**
 * AI Retrain Component
 * Allows admin to retrain AI models
 */
export default function AIRetrain() {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuth();
  const [retraining, setRetraining] = useState(false);
  const [status, setStatus] = useState('');
  const [retrainResults, setRetrainResults] = useState(null);

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">Only administrators can access AI retraining functionality.</p>
        </div>
      </div>
    );
  }

  const handleRetrain = async () => {
    setRetraining(true);
    setStatus('');
    setRetrainResults(null);

    try {
      console.log('Starting AI model retraining...');
      
      const response = await API.post('/ai/retrain');
      
      console.log('Retrain response:', response.data);
      
      setRetrainResults(response.data);
      
      if (response.data.success) {
        setStatus('Model retraining completed successfully!');
      } else {
        setStatus('Model retraining failed. Check the details below.');
      }
    } catch (error) {
      console.error('Error during retraining:', error);
      setStatus('Error starting retraining process: ' + (error.response?.data?.message || error.message));
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">
              {t('ai.retrainModels')}
            </h1>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Important Notice
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Retraining AI models will temporarily affect system performance. 
                        This process may take several minutes to complete and will retrain both 
                        the triage and no-show prediction models.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Models Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Triage Model
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Patient priority classification model that determines urgency levels 
                    based on symptoms and medical history.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="text-gray-900">Urgency Classification</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    No-Show Model
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Appointment no-show prediction model that calculates the probability 
                    of patients missing their scheduled appointments.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="text-gray-900">No-Show Prediction</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retrain Button */}
              <div className="text-center">
                <button
                  onClick={handleRetrain}
                  disabled={retraining}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {retraining ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Retraining Models...</span>
                    </div>
                  ) : (
                    'Start Model Retraining'
                  )}
                </button>
              </div>

              {/* Status Message */}
              {status && (
                <div className={`p-4 rounded-lg ${
                  status.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {status}
                </div>
              )}

              {/* Retrain Results */}
              {retrainResults && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Retraining Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        retrainResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {retrainResults.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Timestamp</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(retrainResults.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {retrainResults.message && (
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                      <p className="text-sm text-gray-600">{retrainResults.message}</p>
                    </div>
                  )}

                  {retrainResults.output && (
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Output</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                        {retrainResults.output}
                      </pre>
                    </div>
                  )}

                  {retrainResults.error && (
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                      <pre className="text-xs text-red-600 whitespace-pre-wrap bg-red-50 p-3 rounded">
                        {retrainResults.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Retraining Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">What Happens</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Models are trained on the latest data</li>
                      <li>• Performance metrics are calculated</li>
                      <li>• New models are deployed automatically</li>
                      <li>• Previous models are backed up</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Expected Duration</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Triage Model: 2-5 minutes</li>
                      <li>• No-Show Model: 3-7 minutes</li>
                      <li>• Total Process: 5-12 minutes</li>
                      <li>• System remains operational</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

