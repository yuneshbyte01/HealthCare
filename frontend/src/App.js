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

// import the profile completion page
import CompletePatientProfile from "./pages/CompletePatientProfile";
import CompleteClinicStaffProfile from "./pages/CompleteClinicStaffProfile";
import CompleteAdminProfile from "./pages/CompleteAdminProfile";

// Profile completion pages for different roles
import PatientProfile from "./pages/PatientProfile";
import ClinicStaffProfile from "./pages/ClinicStaffProfile";
import AdminProfile from "./pages/AdminProfile";

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

        {/* Profile completion for patients */}
        <Route
          path="/complete-patient-profile"
          element={
            <PrivateRoute roles={["patient"]}>
              <CompletePatientProfile />
            </PrivateRoute>
          }
        />

        {/* Profile completion for clinic staff */}
        <Route
          path="/complete-clinic-staff-profile"
          element={
            <PrivateRoute roles={["clinic_staff"]}>
              <CompleteClinicStaffProfile />
            </PrivateRoute>
          }
        />

        {/* Profile completion for admin */}
        <Route
          path="/complete-admin-profile"
          element={
            <PrivateRoute roles={["admin"]}>
              <CompleteAdminProfile />
            </PrivateRoute>
          }
        />

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

        {/* Profile pages for different roles */}
        <Route
          path="/patient-profile"
          element={
            <PrivateRoute roles={["patient"]}>
              <PatientProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/clinic-staff-profile"
          element={
            <PrivateRoute roles={["clinic_staff"]}>
              <ClinicStaffProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-profile"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminProfile />
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
