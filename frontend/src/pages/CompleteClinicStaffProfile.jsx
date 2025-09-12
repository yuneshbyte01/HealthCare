import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * CompleteClinicStaffProfile Component
 * Allows clinic staff to fill in their profile after first login.
 * - Submits data to /api/profile/clinic-staff
 * - Redirects to Clinic Dashboard once completed
 */
export default function CompleteClinicStaffProfile() {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    position: "",
    department: "",
    phone_number: "",
    work_schedule: "",
    permissions: "basic",
    preferred_language: "en",
  });

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang); // switch UI immediately
    setForm({ ...form, preferred_language: lang });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/profile/clinic-staff", form);
      alert(t("profile.success"));
      window.location.href = "/clinic";
    } catch (err) {
      alert(t("profile.failed"));
    }
  };

  return (
    <div>
      <h2>{t("profile.completeClinicStaffProfile")}</h2>
      <form onSubmit={handleSubmit}>
        <label>{t("profile.position")}:</label><br />
        <input
          name="position"
          type="text"
          value={form.position}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.department")}:</label><br />
        <input
          name="department"
          type="text"
          value={form.department}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.phone")}:</label><br />
        <input
          name="phone_number"
          type="text"
          value={form.phone_number}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.workSchedule")}:</label><br />
        <input
          name="work_schedule"
          type="text"
          value={form.work_schedule}
          onChange={handleChange}
        /><br />

        <label>{t("profile.permissions")}:</label><br />
        <select
          name="permissions"
          value={form.permissions}
          onChange={handleChange}
        >
          <option value="basic">Basic</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select><br />

        <label>{t("profile.preferredLanguage")}:</label><br />
        <select
          name="preferred_language"
          value={form.preferred_language}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="np">Nepali</option>
        </select><br /><br />

        <button type="submit">{t("profile.saveProfile")}</button>
      </form>
    </div>
  );
}
