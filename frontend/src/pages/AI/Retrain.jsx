import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

/**
 * AI Retrain Component
 * Allows admin to retrain AI models
 */
export default function AIRetrain() {
  const { t } = useTranslation();
  const [selectedModels, setSelectedModels] = useState([]);
  const [retraining, setRetraining] = useState(false);
  const [status, setStatus] = useState('');

  const models = [
    { id: 'triage', name: 'Triage Model', description: 'Patient priority classification' },
    { id: 'noshow', name: 'No-Show Model', description: 'Appointment no-show prediction' }
  ];

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleRetrain = async () => {
    if (selectedModels.length === 0) {
      setStatus('Please select at least one model to retrain.');
      return;
    }

    setRetraining(true);
    setStatus('');

    try {
      await API.post('/ai/retrain', {
        models: selectedModels
      });
      setStatus('Retraining started successfully! Check status page for progress.');
    } catch (error) {
      setStatus('Error starting retraining process.');
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai.retrainModels')} / मोडेल पुन: तालिम
          </h1>

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
                      This process may take several minutes to complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Models to Retrain / पुन: तालिम गर्न मोडेलहरू छान्नुहोस्
              </h2>
              <div className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={model.id}
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={model.id} className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retrain Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRetrain}
                disabled={retraining || selectedModels.length === 0}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retraining ? t('common.loading') : 'Start Retraining / पुन: तालिम सुरु गर्नुहोस्'}
              </button>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-lg ${
                status.includes('Error') 
                  ? 'bg-red-50 text-red-800 border border-red-200' 
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}>
                {status}
              </div>
            )}

            {/* Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Retraining Process / पुन: तालिम प्रक्रिया</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Models will be trained on the latest data</li>
                <li>• Performance metrics will be updated</li>
                <li>• New models will be deployed automatically</li>
                <li>• Previous models will be backed up</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

