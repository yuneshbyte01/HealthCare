import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * CompleteAdminProfile Component
 * Allows admins to complete their profile after first login.
 * - Submits data to /api/profile/admin
 * - Redirects to Admin Dashboard when done
 */
export default function CompleteAdminProfile() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    permissions: "full",
    super_admin: false,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/profile/admin", form);
      alert(t("profile.success"));
      window.location.href = "/admin"; // redirect to dashboard
    } catch (err) {
      alert(t("profile.failed"));
    }
  };

  return (
    <div>
      <h2>{t("profile.completeAdminProfile")}</h2>
      <form onSubmit={handleSubmit}>
        <label>{t("profile.permissions")}:</label><br />
        <select
          name="permissions"
          value={form.permissions}
          onChange={handleChange}
        >
          <option value="full">Full</option>
          <option value="read-only">Read Only</option>
        </select><br /><br />

        <label>
          <input
            type="checkbox"
            name="super_admin"
            checked={form.super_admin}
            onChange={handleChange}
          />
          Super Admin
        </label><br /><br />

        <button type="submit">{t("profile.saveProfile")}</button>
      </form>
    </div>
  );
}
