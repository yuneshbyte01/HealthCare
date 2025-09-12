import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Navbar Component
 * - Displays navigation links based on authentication and user role
 * - Provides language toggle and logout functionality
 */
export default function Navbar() {
  const { t, i18n } = useTranslation();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Switch UI language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Logout and clear local storage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <nav style={{ padding: "10px", background: "#f0f0f0" }}>
      {/* Always visible */}
      <Link to="/">{t("common.home")}</Link> |{" "}

      {/* If NOT logged in */}
      {!token && (
        <>
          <Link to="/login">{t("common.login")}</Link> |{" "}
          <Link to="/register">{t("common.register")}</Link> |{" "}
        </>
      )}

      {/* Patient Navbar */}
      {role === "patient" && (
        <>
          <Link to="/appointments">{t("appointments.appointments")}</Link> |{" "}
          <Link to="/patient-profile">{t("profile.myProfile")}</Link>
        </>
      )}

      {/* Clinic Staff Navbar */}
      {role === "clinic_staff" && (
        <>
          <Link to="/clinic">{t("clinic.clinicDashboard")}</Link> |{" "}
          <Link to="/clinic-staff-profile">{t("profile.myProfile")}</Link>
        </>
      )}

      {/* Admin Navbar */}
      {role === "admin" && (
        <>
          <Link to="/clinic">{t("clinic.clinicDashboard")}</Link> |{" "}
          <Link to="/admin">{t("admin.dashboard")}</Link> |{" "}
          <Link to="/admin-profile">{t("profile.myProfile")}</Link>
        </>
      )}

      {/* Language toggle (always visible) */}
      {" | "}
      <button onClick={() => changeLanguage("en")}>EN</button>
      <button onClick={() => changeLanguage("np")}>NP</button>

      {/* Logout button (only if logged in) */}
      {token && (
        <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
          {t("common.logout")}
        </button>
      )}
    </nav>
  );
}
