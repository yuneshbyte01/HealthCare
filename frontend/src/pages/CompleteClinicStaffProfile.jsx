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
    specialization: "",
    license_number: "",
    experience_years: "",
    clinic_id: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang); // switch UI immediately
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
        <select
          name="position"
          value={form.position}
          onChange={handleChange}
          required
        >
          <option value="">Select Position</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="assistant">Assistant</option>
        </select><br />

        <label>Specialization:</label><br />
        <input
          name="specialization"
          type="text"
          placeholder="Medical specialization"
          value={form.specialization}
          onChange={handleChange}
        /><br />

        <label>License Number:</label><br />
        <input
          name="license_number"
          type="text"
          placeholder="Professional license number"
          value={form.license_number}
          onChange={handleChange}
        /><br />

        <label>Experience (Years):</label><br />
        <input
          name="experience_years"
          type="number"
          min="0"
          placeholder="Years of experience"
          value={form.experience_years}
          onChange={handleChange}
        /><br />

        <label>Clinic ID:</label><br />
        <input
          name="clinic_id"
          type="number"
          placeholder="Assigned clinic ID"
          value={form.clinic_id}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.preferredLanguage")}:</label><br />
        <select
          name="preferred_language"
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
