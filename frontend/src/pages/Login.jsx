import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * Login Component
 * Renders a login form and handles user authentication.
 * - Stores JWT + role in localStorage
 * - Redirects user based on role and profile completion status
 */
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { t } = useTranslation();

  /**
   * Handle input changes
   * Updates form state as the user types.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission
   * Sends login request, stores JWT + role, and redirects user accordingly.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);

      // Save JWT + role in localStorage for authentication and RBAC
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.role) {
        localStorage.setItem("role", res.data.user.role);
      }

      alert(t("auth.loginSuccess"));

      const role = res.data.user?.role;

      // Profile completion check per role
      if (role === "patient") {
        try {
          const profileRes = await API.get("/profile/patient/me");
          if (!profileRes.data) {
            window.location.href = "/complete-patient-profile";
          } else {
            window.location.href = "/appointments";
          }
        } catch {
          window.location.href = "/complete-patient-profile";
        }
      } else if (role === "clinic_staff") {
        try {
          const profileRes = await API.get("/profile/clinic-staff/me");
          if (!profileRes.data) {
            window.location.href = "/complete-clinic-staff-profile";
          } else {
            window.location.href = "/clinic";
          }
        } catch {
          window.location.href = "/complete-clinic-staff-profile";
        }
      } else if (role === "admin") {
        try {
          const profileRes = await API.get("/profile/admin/me");
          if (!profileRes.data) {
            window.location.href = "/complete-admin-profile";
          } else {
            window.location.href = "/admin";
          }
        } catch {
          window.location.href = "/complete-admin-profile";
        }
      }
    } catch (err) {
      alert(t("auth.loginFailed"));
    }
  };

  return (
    <div>
      <h2>{t("common.login")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder={t("common.email")}
          onChange={handleChange}
          required
        /><br />

        <input
          name="password"
          type="password"
          placeholder={t("common.password")}
          onChange={handleChange}
          required
        /><br />

        <button type="submit">{t("common.login")}</button>
      </form>
    </div>
  );
}
