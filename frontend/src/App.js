import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Profile Pages
import PatientProfile from "./pages/Profile/PatientProfile";
import StaffProfile from "./pages/Profile/StaffProfile";
import AdminProfile from "./pages/Profile/AdminProfile";

// Appointment Pages
import BookAppointment from "./pages/Appointments/Book";
import AppointmentList from "./pages/Appointments/List";
import AppointmentRecommend from "./pages/Appointments/Recommend";
import AppointmentSync from "./pages/Appointments/Sync";
import TestAI from "./pages/Appointments/TestAI";
import AppointmentDetails from './pages/Appointments/Details';

// AI Pages (Admin only)
import AIRetrain from "./pages/AI/Retrain";
import AIStatus from "./pages/AI/Status";

// Analytics Pages
import AnalyticsTrends from "./pages/Analytics/Trends";
import AnalyticsAlerts from "./pages/Analytics/Alerts";
import AnalyticsGeographic from "./pages/Analytics/Geographic";
import AnalyticsPerformance from "./pages/Analytics/Performance";

// Dashboard Pages
import PatientDashboard from "./pages/Dashboards/Patient";
import StaffDashboard from "./pages/Dashboards/Staff";
import AdminDashboard from "./pages/Dashboards/Admin";

// Other Pages
import Home from "./pages/Home";
import Forbidden from "./pages/Forbidden";

/**
 * Main App Component with role-based routing
 */
function App() {
  const { role, isAuthenticated } = useAuth();

  // Role-based dashboard component
  const DashboardComponent = () => {
    switch (role) {
      case 'patient':
        return <PatientDashboard />;
      case 'clinic_staff':
        return <StaffDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  // Role-based redirect component for authenticated users
  const AuthenticatedRedirect = () => {
    if (!isAuthenticated) {
      return <Home />;
    }

    // Redirect authenticated users to their appropriate dashboard
    switch (role) {
      case 'patient':
        return <Navigate to="/dashboard" replace />;
      case 'clinic_staff':
        return <Navigate to="/dashboard" replace />;
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Main content with proper spacing for fixed navbar */}
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Routes - Redirect authenticated users to dashboard */}
              <Route path="/" element={<AuthenticatedRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forbidden" element={<Forbidden />} />

              {/* Dashboard Routes - Role-based */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["patient", "clinic_staff", "admin"]}>
                    <DashboardComponent />
                  </ProtectedRoute>
                }
              />

              {/* Profile Routes */}
              <Route
                path="/profile/patient"
                element={
                  <ProtectedRoute roles={["patient"]}>
                    <PatientProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/clinic-staff"
                element={
                  <ProtectedRoute roles={["clinic_staff"]}>
                    <StaffProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />

              {/* Appointment Routes */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute roles={["patient", "clinic_staff", "admin"]}>
                    <AppointmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/:id"
                element={
                  <ProtectedRoute roles={["patient", "clinic_staff", "admin"]}>
                    <AppointmentDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/book"
                element={
                  <ProtectedRoute roles={["patient"]}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/recommend"
                element={
                  <ProtectedRoute roles={["patient"]}>
                    <AppointmentRecommend />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/sync"
                element={
                  <ProtectedRoute roles={["patient"]}>
                    <AppointmentSync />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/test-ai"
                element={
                  <ProtectedRoute roles={["patient", "clinic_staff", "admin"]}>
                    <TestAI />
                  </ProtectedRoute>
                }
              />

              {/* AI Management Routes (Admin only) */}
              <Route
                path="/ai"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AIStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai/retrain"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AIRetrain />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai/status"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AIStatus />
                  </ProtectedRoute>
                }
              />

              {/* Analytics Routes */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute roles={["clinic_staff", "admin"]}>
                    <AnalyticsTrends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/trends"
                element={
                  <ProtectedRoute roles={["clinic_staff", "admin"]}>
                    <AnalyticsTrends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/alerts"
                element={
                  <ProtectedRoute roles={["clinic_staff", "admin"]}>
                    <AnalyticsAlerts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/geographic"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AnalyticsGeographic />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/performance"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AnalyticsPerformance />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route - redirect to dashboard for authenticated users */}
              <Route 
                path="*" 
                element={
                  isAuthenticated ? 
                    <Navigate to="/dashboard" replace /> : 
                    <Navigate to="/" replace />
                } 
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;