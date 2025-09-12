import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/i18n"; // Initialize i18n configuration

/**
 * Entry point of the React application.
 * Renders the App component inside the root element.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
