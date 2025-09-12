import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import np from "./np.json";

/**
 * i18n Configuration
 * Sets up internationalization with English and Nepali translations.
 */
i18n
  .use(initReactI18next) // Connects i18n with React
  .init({
    resources: {
      en: { translation: en }, // English translations
      np: { translation: np }, // Nepali translations
    },
    lng: "en", // Default language
    fallbackLng: "en", // Fallback if translation is missing
    interpolation: { escapeValue: false }, // React already escapes values
  });

export default i18n;
