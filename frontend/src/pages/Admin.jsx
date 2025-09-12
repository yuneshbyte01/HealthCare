import { useTranslation } from "react-i18next";

/**
 * Admin Component
 * - Displays admin dashboard
 * - Placeholder for system logs and user management
 */
export default function Admin() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "20px" }}>
      <h2>{t("admin.dashboard")}</h2>
      <p>{t("admin.systemLogs")}</p>
      <p>{t("admin.manageUsers")}</p>

      {/* System Logs Section */}
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>{t("admin.systemLogs")}</h3>
        <p>{t("errors.unexpectedError")} (demo placeholder)</p>
      </div>

      {/* Manage Users Section */}
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>{t("admin.manageUsers")}</h3>
        <p>{t("homePage.homeMessage")} (demo placeholder)</p>
      </div>
    </div>
  );
}
