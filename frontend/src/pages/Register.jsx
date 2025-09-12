import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * Register Component
 * Renders a registration form and handles user sign-up.
 */
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { t } = useTranslation();

  /**
   * Handle input changes
   * Updates form state when user types.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission
   * Sends registration data to backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert(t("auth.registerSuccess"));
      window.location.href = "/login"; // Redirect after success
    } catch (err) {
      alert(t("auth.registerFailed"));
    }
  };

  return (
    <div>
      <h2>{t("common.register")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder={t("common.name")}
          onChange={handleChange}
          required
        /><br/>
        
        <input
          name="email"
          type="email"
          placeholder={t("common.email")}
          onChange={handleChange}
          required
        /><br/>
        
        <input
          name="password"
          type="password"
          placeholder={t("common.password")}
          onChange={handleChange}
          required
        /><br/>
        
        <button type="submit">{t("common.register")}</button>
      </form>
    </div>
  );
}
