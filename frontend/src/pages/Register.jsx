import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * Register Component
 * Renders a registration form and handles user sign-up.
 */
export default function Register() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "patient",
    phone: "",
    preferred_language: "nepali"
  });
  const { t, i18n } = useTranslation();

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
      
      {/* Language Switcher */}
      <div style={{ marginBottom: "10px" }}>
        <label>Language: </label>
        <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="np">Nepali</option>
        </select>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder={t("common.name")}
          value={form.name}
          onChange={handleChange}
          required
        /><br/>
        
        <input
          name="email"
          type="email"
          placeholder={t("common.email")}
          value={form.email}
          onChange={handleChange}
          required
        /><br/>
        
        <input
          name="password"
          type="password"
          placeholder={t("common.password")}
          value={form.password}
          onChange={handleChange}
          required
        /><br/>

        <input
          name="phone"
          type="tel"
          placeholder="Phone Number (Optional)"
          value={form.phone}
          onChange={handleChange}
        /><br/>

        <label>Role:</label><br/>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="patient">Patient</option>
          <option value="clinic_staff">Clinic Staff</option>
          <option value="admin">Admin</option>
        </select><br/>

        <label>Preferred Language:</label><br/>
        <select
          name="preferred_language"
          value={form.preferred_language}
          onChange={(e) => {
            handleChange(e);
            i18n.changeLanguage(e.target.value);
          }}
        >
          <option value="nepali">Nepali</option>
          <option value="en">English</option>
        </select><br/>
        
        <button type="submit">{t("common.register")}</button>
      </form>
    </div>
  );
}
