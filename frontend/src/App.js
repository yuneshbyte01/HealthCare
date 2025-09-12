import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Appointments from "./pages/Appointments";
import Clinic from "./pages/Clinic";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";

/**
 * App Component
 * Root component that handles routing, navigation, and language switching.
 */
function App() {
  const { t, i18n } = useTranslation();

  // Switch UI language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Router>
      {/* Navigation bar */}
      <nav style={{ padding: "10px", background: "#f0f0f0" }}>
        <Link to="/">{t("common.home")}</Link> |{" "}
        <Link to="/login">{t("common.login")}</Link> |{" "}
        <Link to="/register">{t("common.register")}</Link> |{" "}
        <Link to="/appointments">{t("appointments.appointments")}</Link> |{" "}
        <Link to="/clinic">{t("clinic.clinicDashboard")}</Link> |{" "}
        <button onClick={() => changeLanguage("en")}>EN</button>
        <button onClick={() => changeLanguage("np")}>NP</button>
      </nav>

      {/* Define application routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes (require authentication) */}
        <Route
          path="/appointments"
          element={<PrivateRoute><Appointments /></PrivateRoute>}
        />
        <Route
          path="/clinic"
          element={<PrivateRoute><Clinic /></PrivateRoute>}
        />
      </Routes>
    </Router>
  );
}

export default App;
