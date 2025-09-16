import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

/**
 * Simple Home Page Component
 * Clean landing page with mobile-first design
 */
export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated, role, user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeUsers: 0,
    systemHealth: 'Unknown'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSystemStats();
    }
  }, [isAuthenticated]);

  const fetchSystemStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/analytics/system-stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load system statistics:', err);
      setError('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    // Redirect to appropriate dashboard
    const dashboardPath = role === 'patient' ? '/dashboard/patient' : 
                         role === 'clinic_staff' ? '/dashboard/staff' : 
                         '/dashboard/admin';
    return <Link to={dashboardPath} className="sr-only">Go to Dashboard</Link>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('home.title', 'Smart Healthcare for Rural Nepal')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.subtitle', 'AI-powered appointment system designed for rural healthcare access')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3"
              >
                {t('common.getStarted', 'Get Started')}
              </Link>
              <Link
                to="/login"
                className="btn btn-outline text-lg px-8 py-3"
              >
                {t('common.login')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t('home.features.title', 'Key Features')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('home.features.subtitle', 'Everything you need for modern healthcare management')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="card card-hover text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('home.features.ai.title', 'AI-Powered Triage')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.ai.description', 'Smart appointment scheduling with AI-driven urgency assessment')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card card-hover text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('home.features.mobile.title', 'Mobile-First Design')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.mobile.description', 'Optimized for mobile devices with offline capabilities')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card card-hover text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('home.features.multilingual.title', 'Multilingual Support')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.multilingual.description', 'Available in English and Nepali for better accessibility')}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card card-hover text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('home.features.analytics.title', 'Real-time Analytics')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.analytics.description', 'Comprehensive insights and reporting for healthcare providers')}
            </p>
          </div>

          {/* Feature 5 */}
          <div className="card card-hover text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('home.features.security.title', 'Secure & Private')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.security.description', 'HIPAA-compliant with end-to-end encryption')}
            </p>
          </div>

          {/* Feature 6 */}
          <div className="card card-hover text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('home.features.fast.title', 'Fast & Reliable')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.fast.description', 'Lightning-fast performance with 99.9% uptime')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t('home.stats.title', 'Trusted by Healthcare Providers')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                {loading ? (
                  <div className="spinner mx-auto"></div>
                ) : error ? (
                  '--'
                ) : (
                  stats.totalAppointments.toLocaleString()
                )}
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                {t('home.stats.appointments', 'Appointments Scheduled')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                {loading ? (
                  <div className="spinner mx-auto"></div>
                ) : error ? (
                  '--'
                ) : (
                  stats.activeUsers.toLocaleString()
                )}
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                {t('home.stats.users', 'Active Users')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                {loading ? (
                  <div className="spinner mx-auto"></div>
                ) : error ? (
                  '--'
                ) : (
                  '99.9%'
                )}
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                {t('home.stats.uptime', 'System Uptime')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="healthcare-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('home.cta.title', 'Ready to Transform Healthcare?')}
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('home.cta.subtitle', 'Join thousands of healthcare providers using our AI-powered platform')}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.getStarted', 'Get Started Today')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
