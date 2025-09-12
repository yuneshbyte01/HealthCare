import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Appointments from "./pages/Appointments";
import Clinic from "./pages/Clinic";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Router>
      <nav style={{ padding: "10px", background: "#f0f0f0" }}>
        <Link to="/">{t("home")}</Link> |{" "}
        <Link to="/login">{t("login")}</Link> |{" "}
        <Link to="/register">{t("register")}</Link> |{" "}
        <Link to="/appointments">{t("appointments")}</Link> |{" "}
        <Link to="/clinic">{t("clinicDashboard")}</Link> |{" "}
        <button onClick={() => changeLanguage("en")}>EN</button>
        <button onClick={() => changeLanguage("np")}>NP</button>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
