import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar Component with TailwindCSS styling
 * - Role-based navigation links
 * - Language toggle (EN | NP)
 * - Modern healthcare design
 */
export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  // Switch UI language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Logout and redirect
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Navigation links based on role
  const getNavigationLinks = () => {
    const commonLinks = [
      { path: "/", label: t("common.home") }
    ];

    if (!role) {
      return [
        ...commonLinks,
        { path: "/login", label: t("common.login") },
        { path: "/register", label: t("common.register") }
      ];
    }

    const roleSpecificLinks = {
      patient: [
        { path: "/dashboard", label: t("common.dashboard") },
        { path: "/profile/patient", label: t("profile.myProfile") },
        { path: "/appointments", label: t("appointments.appointments") },
        { path: "/appointments/sync", label: t("appointments.sync") }
      ],
      clinic_staff: [
        { path: "/dashboard", label: t("common.dashboard") },
        { path: "/profile/clinic-staff", label: t("profile.myProfile") },
        { path: "/appointments", label: t("appointments.appointments") },
        { path: "/analytics", label: t("analytics.trends") }
      ],
      admin: [
        { path: "/dashboard", label: t("common.dashboard") },
        { path: "/profile/admin", label: t("profile.myProfile") },
        { path: "/appointments", label: t("appointments.appointments") },
        { path: "/ai", label: t("ai.management") },
        { path: "/analytics", label: t("analytics.trends") }
      ]
    };

    return [...commonLinks, ...(roleSpecificLinks[role] || [])];
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="healthcare-gradient text-white px-3 py-1 rounded-lg font-bold text-lg">
                🏥 HealthCare AI
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {getNavigationLinks().map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-gray-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Language Toggle & Logout */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  i18n.language === "en" 
                    ? "bg-primary-500 text-white" 
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("np")}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  i18n.language === "np" 
                    ? "bg-primary-500 text-white" 
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                नेपा
              </button>
            </div>

            {/* Logout Button */}
            {role && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                {t("common.logout")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
