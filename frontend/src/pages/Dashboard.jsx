import { useEffect, useState } from "react";
import API from "../services/api";

/**
 * Dashboard Component
 * Displays appointments with AI insights including urgency and no-show risk
 * Supports color-coded visualization for prioritization
 */
export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  /**
   * Fetch appointments from backend API
   */
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await API.get("/appointments");
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get color for urgency level
   */
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "urgent":
        return { color: "red", fontWeight: "bold" };
      case "moderate":
        return { color: "orange", fontWeight: "bold" };
      case "routine":
        return { color: "green", fontWeight: "normal" };
      default:
        return { color: "gray", fontWeight: "normal" };
    }
  };

  /**
   * Format no-show risk as percentage
   */
  const formatNoShowRisk = (risk) => {
    if (risk === null || risk === undefined) return "N/A";
    return `${(parseFloat(risk) * 100).toFixed(0)}%`;
  };

  /**
   * Get status badge style
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: "#e3f2fd", color: "#1976d2" };
      case "completed":
        return { backgroundColor: "#e8f5e8", color: "#2e7d32" };
      case "cancelled":
        return { backgroundColor: "#ffebee", color: "#c62828" };
      default:
        return { backgroundColor: "#f5f5f5", color: "#666" };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Dashboard</h2>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Dashboard</h2>
        <div style={{ color: "red", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
          {error}
        </div>
        <button onClick={fetchAppointments} style={{ marginTop: "10px", padding: "8px 16px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Dashboard - AI Insights</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        View your appointments with AI-powered urgency assessment and no-show risk prediction
      </p>

      {appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <h3>No appointments found</h3>
          <p>Book your first appointment to see AI insights here!</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table 
            style={{ 
              width: "100%", 
              borderCollapse: "collapse", 
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  📅 Date & Time
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  📋 Status
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  🚨 AI Urgency
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  📊 No-Show Risk
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  🏥 Staff ID
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>
                  🏢 Clinic ID
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr 
                  key={appointment.id}
                  style={{ 
                    borderBottom: "1px solid #eee",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {new Date(appointment.date).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <span 
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        ...getStatusStyle(appointment.status)
                      }}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <span style={getUrgencyColor(appointment.urgency)}>
                      {appointment.urgency || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <span style={{ 
                      fontWeight: "500",
                      color: parseFloat(appointment.no_show_risk) > 0.7 ? "red" : 
                             parseFloat(appointment.no_show_risk) > 0.4 ? "orange" : "green"
                    }}>
                      {formatNoShowRisk(appointment.no_show_risk)}
                    </span>
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {appointment.staff_id || "N/A"}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {appointment.clinic_id || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Insights Summary */}
      {appointments.length > 0 && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>🤖 AI Insights Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}>
                {appointments.length}
              </div>
              <div style={{ color: "#666" }}>Total Appointments</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>
                {appointments.filter(a => a.urgency === "urgent").length}
              </div>
              <div style={{ color: "#666" }}>Urgent Cases</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "orange" }}>
                {appointments.filter(a => a.urgency === "moderate").length}
              </div>
              <div style={{ color: "#666" }}>Moderate Cases</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "green" }}>
                {appointments.filter(a => a.urgency === "routine").length}
              </div>
              <div style={{ color: "#666" }}>Routine Cases</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          onClick={fetchAppointments}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
}
