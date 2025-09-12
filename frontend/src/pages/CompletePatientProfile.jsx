import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * CompletePatientProfile Component
 * Allows patients to fill in their profile information after first login.
 * - Submits data to /api/profile/patient
 * - Redirects to Appointments dashboard once completed
 * - Supports English and Nepali languages
 */
export default function CompletePatientProfile() {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    dob: "",
    phone_number: "",
    gender: "",
    address: "",
    medical_history: "",
    preferred_language: "en",
  });

  /**
   * Handle input changes
   * Updates the form state as the user types/selects values.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission
   * Handle form submission.
   * Sends the profile data to the backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/profile/patient", form);
      alert(t("profile.success"));
      window.location.href = "/appointments"; // redirect patient to their dashboard
    } catch (err) {
      alert(t("profile.failed"));
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang); // update UI immediately
    setForm({ ...form, preferred_language: lang });
  };

  return (
    <div>
      <h2>{t("profile.completePatientProfile")}</h2>
      <form onSubmit={handleSubmit}>
        <label>{t("profile.dob")}:</label><br />
        <input
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.phone")}:</label><br />
        <input
          name="phone_number"
          type="text"
          placeholder={t("profile.phone")}
          value={form.phone_number}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.gender")}:</label><br />
        <input
          name="gender"
          type="text"
          placeholder={t("profile.gender")}
          value={form.gender}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.address")}:</label><br />
        <input
          name="address"
          type="text"
          placeholder={t("profile.address")}
          value={form.address}
          onChange={handleChange}
        /><br />

        <label>{t("profile.medicalHistory")}:</label><br />
        <textarea
          name="medical_history"
          placeholder={t("profile.medicalHistory")}
          value={form.medical_history}
          onChange={handleChange}
        /><br />

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
