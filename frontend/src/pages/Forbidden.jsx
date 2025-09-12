import { useTranslation } from "react-i18next";

/**
 * Forbidden Component
 * Displays a 403 access denied message for unauthorized users.
 */
export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>{t("forbidden.accessDenied")}</h2>
      <p>{t("forbidden.noPermission")}</p>
    </div>
  );
}
