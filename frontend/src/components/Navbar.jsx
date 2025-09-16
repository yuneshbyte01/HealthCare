import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

/**
 * Enhanced Navigation Bar Component
 * Modern, mobile-first design with better UX
 */
export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get navigation items based on role
  const getNavigationItems = () => {
    if (!isAuthenticated) return [];

    const baseItems = [
      { to: "/dashboard", label: t('common.dashboard'), icon: "🏠" },
      { to: "/appointments", label: t('appointments.appointments'), icon: "📅" }
    ];

    if (role === 'clinic_staff' || role === 'admin') {
      baseItems.push({ to: "/analytics", label: t('analytics.title'), icon: "📊" });
    }

    if (role === 'admin') {
      baseItems.push({ to: "/ai", label: t('ai.title'), icon: "🤖" });
    }

    return baseItems;
  };

  const getProfilePath = () => {
    switch (role) {
      case 'patient': return '/profile/patient';
      case 'clinic_staff': return '/profile/clinic-staff';
      case 'admin': return '/profile/admin';
      default: return '/profile';
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navigation */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center space-x-2 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="healthcare-gradient text-white px-3 py-1.5 rounded-lg font-bold text-lg transition-transform group-hover:scale-105">
              🏥 HealthCare
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActiveRoute(item.to)
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                  i18n.language === 'en' 
                    ? 'bg-white text-blue-600 shadow-sm font-medium' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('np')}
                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                  i18n.language === 'np' 
                    ? 'bg-white text-blue-600 shadow-sm font-medium' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                नेपा
              </button>
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User Avatar & Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-24">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {t(`roles.${role}`)}
                    </div>
                  </div>
                </div>

                {/* Profile & Logout */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={getProfilePath()}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t('profile.myProfile')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('common.logout')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 border-t border-gray-200' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="py-4 space-y-3">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {t(`roles.${role}`)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {getNavigationItems().map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActiveRoute(item.to)
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Profile Link */}
                <Link
                  to={getProfilePath()}
                  className="flex items-center space-x-3 px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">👤</span>
                  <span>{t('profile.myProfile')}</span>
                </Link>

                {/* Language Switcher */}
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    {t('common.language')}
                  </div>
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                        i18n.language === 'en' 
                          ? 'bg-white text-blue-600 shadow-sm font-medium' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage('np')}
                      className={`px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                        i18n.language === 'np' 
                          ? 'bg-white text-blue-600 shadow-sm font-medium' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      नेपाली
                    </button>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span className="text-lg">🚪</span>
                  <span>{t('common.logout')}</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="block btn btn-primary text-sm text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
