import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

/**
 * Home Page Component
 * Landing page with role-based content
 */
export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="healthcare-gradient text-white px-8 py-4 rounded-xl font-bold text-4xl mb-8 inline-block">
            🏥 HealthCare AI System
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('common.welcome')}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            {t('homePage.homeMessage')}
          </p>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Welcome back, {role}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/dashboard"
                className="bg-primary-500 hover:bg-primary-600 text-white p-6 rounded-xl text-center transition-all transform hover:scale-105"
              >
                <div className="text-3xl mb-3">📊</div>
                <div className="font-semibold text-lg">
                  {t('common.dashboard')}
                </div>
              </Link>

              <Link
                to="/appointments"
                className="bg-secondary-500 hover:bg-secondary-600 text-white p-6 rounded-xl text-center transition-all transform hover:scale-105"
              >
                <div className="text-3xl mb-3">📅</div>
                <div className="font-semibold text-lg">
                  {t('appointments.appointments')}
                </div>
              </Link>

              <Link
                to={role === 'patient' ? '/profile/patient' : role === 'clinic_staff' ? '/profile/clinic-staff' : '/profile/admin'}
                className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl text-center transition-all transform hover:scale-105"
              >
                <div className="text-3xl mb-3">👤</div>
                <div className="font-semibold text-lg">
                  {t('profile.myProfile')}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <div className="healthcare-gradient text-white px-8 py-4 rounded-xl font-bold text-4xl mb-8 inline-block">
          🏥 HealthCare AI System
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {t('common.welcome')}
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Advanced healthcare management system with AI-powered appointment scheduling, 
          patient triage, and predictive analytics for better healthcare outcomes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Intelligent appointment scheduling and patient triage using machine learning
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              Comprehensive analytics and insights for better healthcare management
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bilingual</h3>
            <p className="text-gray-600">
              Full support for English and Nepali languages
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all transform hover:scale-105"
          >
            {t('common.login')}
          </Link>
          <Link
            to="/register"
            className="bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all transform hover:scale-105"
          >
            {t('common.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
