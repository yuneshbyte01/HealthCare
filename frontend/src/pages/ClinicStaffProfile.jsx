import { useEffect, useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * ClinicStaffProfile Component
 * Fetches and displays the logged-in clinic staff's profile.
 */
export default function ClinicStaffProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile/clinic-staff/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch clinic staff profile", err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <p>{t("errors.networkError")}</p>;

  return (
    <div>
      <h2>{t("profile.completeClinicStaffProfile")}</h2>
      <p><b>{t("profile.position")}:</b> {profile.position}</p>
      <p><b>{t("profile.department")}:</b> {profile.department}</p>
      <p><b>{t("profile.phone")}:</b> {profile.phone_number}</p>
      <p><b>{t("profile.workSchedule")}:</b> {profile.work_schedule}</p>
      <p><b>{t("profile.permissions")}:</b> {profile.permissions}</p>
    </div>
  );
}
