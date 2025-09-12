import { useEffect, useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

/**
 * AdminProfile Component
 * Fetches and displays the current admin's profile.
 */
export default function AdminProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile/admin/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <p>{t("errors.networkError")}</p>;

  return (
    <div>
      <h2>{t("admin.dashboard")}</h2>
      <p><b>{t("profile.permissions")}:</b> {profile.permissions}</p>
      <p><b>Super Admin:</b> {profile.super_admin ? "Yes" : "No"}</p>
    </div>
  );
}
