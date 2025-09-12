import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Appointments from "./pages/Appointments";
import Clinic from "./pages/Clinic";
import Admin from "./pages/Admin";
import Forbidden from "./pages/Forbidden";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

/**
 * App Component
 * Root component that handles routing and navigation.
 */
function App() {
  return (
    <Router>
      {/* Navigation bar */}
      <Navbar />

      {/* Define application routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with roles */}
        <Route
          path="/appointments"
          element={
            <PrivateRoute roles={["patient"]}>
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic"
          element={
            <PrivateRoute roles={["clinic_staff", "admin"]}>
              <Clinic />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <Admin />
            </PrivateRoute>
          }
        />

        {/* Forbidden page for unauthorized role attempts */}
        <Route path="/forbidden" element={<Forbidden />} />
      </Routes>
    </Router>
  );
}

export default App;
