import { useTranslation } from "react-i18next";

/**
 * Home Component
 * Displays a welcome message using translations.
 */
export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t("common.welcome")}</h2>
      <p>{t("homePage.homeMessage")}</p>
    </div>
  );
}
