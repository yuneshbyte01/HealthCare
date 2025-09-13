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
    permissions: {"manage_users": true, "delete_logs": false},
    notes: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle permission changes
  const handlePermissionChange = (permission, value) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [permission]: value
      }
    });
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
        <label>Admin Permissions:</label><br />
        
        <label>
          <input
            type="checkbox"
            checked={form.permissions.manage_users}
            onChange={(e) => handlePermissionChange('manage_users', e.target.checked)}
          />
          Manage Users
        </label><br />

        <label>
          <input
            type="checkbox"
            checked={form.permissions.delete_logs}
            onChange={(e) => handlePermissionChange('delete_logs', e.target.checked)}
          />
          Delete Logs
        </label><br /><br />

        <label>Notes:</label><br />
        <textarea
          name="notes"
          placeholder="Additional notes or comments"
          value={form.notes}
          onChange={handleChange}
        /><br /><br />

        <button type="submit">{t("profile.saveProfile")}</button>
      </form>
    </div>
  );
}
