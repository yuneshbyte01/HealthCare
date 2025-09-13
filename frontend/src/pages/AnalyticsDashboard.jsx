import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import API from "../services/api";

/**
 * Analytics Dashboard Component
 * Displays comprehensive health insights and analytics for clinic staff and admins
 * Includes trends, alerts, and geographic distribution
 */
export default function AnalyticsDashboard() {
  const [trends, setTrends] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [geographic, setGeographic] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  /**
   * Fetch all analytics data from backend
   */
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics endpoints in parallel
      const [trendsRes, alertsRes, geographicRes, performanceRes] = await Promise.allSettled([
        API.get("/analytics/trends"),
        API.get("/analytics/alerts"),
        API.get("/analytics/geographic"),
        API.get("/analytics/performance")
      ]);

      // Set data for successful requests
      if (trendsRes.status === "fulfilled") {
        setTrends(trendsRes.value.data);
      }
      if (alertsRes.status === "fulfilled") {
        setAlerts(alertsRes.value.data);
      }
      if (geographicRes.status === "fulfilled") {
        setGeographic(geographicRes.value.data);
      }
      if (performanceRes.status === "fulfilled") {
        setPerformance(performanceRes.value.data);
      }

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Get color for risk level
   */
  const getRiskColor = (risk) => {
    switch (risk) {
      case "high_risk": return "#ff4444";
      case "medium_risk": return "#ff8800";
      case "low_risk": return "#00aa00";
      default: return "#888888";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>📊 Health Analytics Dashboard</h2>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>📊 Health Analytics Dashboard</h2>
        <div style={{ color: "red", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
          {error}
        </div>
        <button onClick={fetchAnalyticsData} style={{ marginTop: "10px", padding: "8px 16px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Health Analytics Dashboard</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Comprehensive health insights for resource allocation and policy planning
      </p>

      {/* Health Alerts Section */}
      {alerts && alerts.alerts && alerts.alerts.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h3>🚨 Health Alerts</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {alerts.alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  backgroundColor: alert.severity === "high" ? "#ffebee" : "#fff3e0",
                  border: `1px solid ${alert.severity === "high" ? "#f44336" : "#ff9800"}`,
                  borderRadius: "8px",
                  borderLeft: `4px solid ${alert.severity === "high" ? "#f44336" : "#ff9800"}`
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  {alert.type === "urgent_cases" && "🚨 Urgent Cases Alert"}
                  {alert.type === "noshow_risk" && "📊 No-Show Risk Alert"}
                  {alert.type === "capacity" && "🏥 Capacity Alert"}
                </div>
                <div>{alert.message}</div>
                {alert.count && (
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                    Count: {alert.count} | Threshold: {alert.threshold}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {alerts && (
        <div style={{ marginBottom: "30px" }}>
          <h3>📈 Summary Statistics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f44336" }}>
                {alerts.summary?.urgent_cases_this_week || 0}
              </div>
              <div style={{ color: "#666" }}>Urgent Cases (7 days)</div>
            </div>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800" }}>
                {alerts.summary?.high_risk_noshow || 0}
              </div>
              <div style={{ color: "#666" }}>High No-Show Risk</div>
            </div>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2196f3" }}>
                {alerts.summary?.capacity_alerts || 0}
              </div>
              <div style={{ color: "#666" }}>Capacity Alerts</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        {/* Urgency Distribution Chart */}
        {trends && trends.urgency_distribution && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h4>🚨 Urgency Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.urgency_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="urgency" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* No-Show Risk Distribution */}
        {trends && trends.noshow_risk_distribution && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h4>📊 No-Show Risk Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trends.noshow_risk_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {trends.noshow_risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk_category)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Trends Chart */}
        {trends && trends.daily_trends && trends.daily_trends.length > 0 && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", gridColumn: "1 / -1" }}>
            <h4>📈 Daily Trends (Last 7 Days)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.daily_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="appointment_date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Geographic Distribution */}
      {geographic && geographic.geographic_distribution && (
        <div style={{ marginBottom: "30px" }}>
          <h3>🗺️ Geographic Distribution</h3>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Location</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Appointments</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Avg No-Show Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {geographic.geographic_distribution.map((location, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{location.address}</td>
                      <td style={{ padding: "12px" }}>{location.appointment_count}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ 
                          color: parseFloat(location.avg_noshow_risk) > 0.7 ? "red" : 
                                 parseFloat(location.avg_noshow_risk) > 0.4 ? "orange" : "green"
                        }}>
                          {(parseFloat(location.avg_noshow_risk) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Performance Metrics */}
      {performance && (
        <div style={{ marginBottom: "30px" }}>
          <h3>🤖 AI Performance Metrics</h3>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#4caf50" }}>
                  {performance.model_status?.triage_model || "Unknown"}
                </div>
                <div style={{ color: "#666" }}>Triage Model Status</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#4caf50" }}>
                  {performance.model_status?.noshow_model || "Unknown"}
                </div>
                <div style={{ color: "#666" }}>No-Show Model Status</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#2196f3" }}>
                  {performance.model_status?.last_retrain ? 
                    new Date(performance.model_status.last_retrain).toLocaleDateString() : "Unknown"}
                </div>
                <div style={{ color: "#666" }}>Last Retrain</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button 
          onClick={fetchAnalyticsData}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh Analytics
        </button>
      </div>
    </div>
  );
}
