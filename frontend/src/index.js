import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/i18n"; // Initialize i18n configuration
import { AuthProvider } from "./context/AuthContext";

/**
 * Entry point of the React application.
 * Renders the App component inside the root element with AuthContext.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
