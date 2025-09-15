import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Forbidden Page Component
 * Shows when user doesn't have permission to access a page
 */
export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">🚫</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('forbidden.title')}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {t('forbidden.noPermission')}
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            {t('forbidden.goHome')}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
