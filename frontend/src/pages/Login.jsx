import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * Login Component
 * Renders a login form and handles user authentication.
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
   * Sends login request, stores JWT token, and redirects on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);

      // Save JWT token in localStorage for authenticated requests
      localStorage.setItem("token", res.data.token);

      alert(t("auth.loginSuccess"));
      window.location.href = "/appointments"; // Redirect after success
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
        /><br/>

        <input
          name="password"
          type="password"
          placeholder={t("common.password")}
          onChange={handleChange}
          required
        /><br/>

        <button type="submit">{t("common.login")}</button>
      </form>
    </div>
  );
}
