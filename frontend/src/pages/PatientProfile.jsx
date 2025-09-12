import { useEffect, useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * PatientProfile Component
 * Fetches and displays the current patient's profile from the backend.
 */
export default function PatientProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile/patient/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch patient profile", err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <p>{t("errors.networkError")}</p>;

  return (
    <div>
      <h2>{t("profile.completePatientProfile")}</h2>
      <p><b>{t("profile.dob")}:</b> {profile.dob}</p>
      <p><b>{t("profile.phone")}:</b> {profile.phone_number}</p>
      <p><b>{t("profile.gender")}:</b> {profile.gender}</p>
      <p><b>{t("profile.address")}:</b> {profile.address}</p>
      <p><b>{t("profile.medicalHistory")}:</b> {profile.medical_history}</p>
      <p><b>{t("profile.preferredLanguage")}:</b> {profile.preferred_language}</p>
    </div>
  );
}
