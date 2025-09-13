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
    date_of_birth: "",
    gender: "",
    address: "",
    blood_group: "",
    allergies: "",
    chronic_conditions: "",
    emergency_contact: "",
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
  };

  return (
    <div>
      <h2>{t("profile.completePatientProfile")}</h2>
      <form onSubmit={handleSubmit}>
        <label>{t("profile.dob")}:</label><br />
        <input
          name="date_of_birth"
          type="date"
          value={form.date_of_birth}
          onChange={handleChange}
          required
        /><br />

        <label>{t("profile.gender")}:</label><br />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select><br />

        <label>{t("profile.address")}:</label><br />
        <textarea
          name="address"
          placeholder={t("profile.address")}
          value={form.address}
          onChange={handleChange}
        /><br />

        <label>Blood Group:</label><br />
        <select
          name="blood_group"
          value={form.blood_group}
          onChange={handleChange}
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select><br />

        <label>Allergies:</label><br />
        <textarea
          name="allergies"
          placeholder="List any allergies"
          value={form.allergies}
          onChange={handleChange}
        /><br />

        <label>Chronic Conditions:</label><br />
        <textarea
          name="chronic_conditions"
          placeholder="List any chronic conditions"
          value={form.chronic_conditions}
          onChange={handleChange}
        /><br />

        <label>Emergency Contact:</label><br />
        <input
          name="emergency_contact"
          type="text"
          placeholder="Emergency contact number"
          value={form.emergency_contact}
          onChange={handleChange}
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
