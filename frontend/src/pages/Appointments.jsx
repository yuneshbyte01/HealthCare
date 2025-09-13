import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import {
  saveOfflineAppointment,
  getOfflineAppointments,
  clearOfflineAppointments,
} from "../services/offline";
import { useTranslation } from "react-i18next";

/**
 * Appointments Component
 * - Displays user appointments
 * - Allows booking and cancelling
 * - Supports offline mode (saves locally and syncs when back online)
 */
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [staffId, setStaffId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [recommendation, setRecommendation] = useState(null); // AI recommendation
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const { t } = useTranslation();

  /**
   * Fetch all appointments from the backend.
   * Falls back to offline mode if network is unavailable.
   */
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await API.get("/appointments");
      console.log("Fetched appointments:", res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      console.log(t("offline.offlineFetchError"));
    }
  }, [t]);

  /**
   * Book a new appointment.
   * - If online: save directly to backend.
   * - If offline: store locally for later sync.
   */
  const bookAppointment = async () => {
    if (!date) {
      alert("Please select a date before booking.");
      return;
    }
    
    const newAppt = { 
      date, 
      staff_id: staffId || null, 
      clinic_id: clinicId || null, 
      urgency 
    };
    
    console.log("Booking appointment:", newAppt);
    
    try {
      const res = await API.post("/appointments", newAppt);
      console.log("Appointment booked successfully:", res.data);
      setAppointments([...appointments, res.data]);
      setDate(""); // reset
      setStaffId("");
      setClinicId("");
      setUrgency("routine");
    } catch (err) {
      console.error("Error booking appointment:", err);
      console.log("Saving offline appointment");
      await saveOfflineAppointment(newAppt);
      alert(t("appointments.appointmentSavedOffline"));
    }
  };

  /**
   * Cancel an appointment by ID.
   * If offline, shows an error message.
   */
  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert(t("appointments.cancelFailedOffline"));
    }
  };

  /**
   * Sync locally saved appointments with the backend.
   * Triggered automatically when the app detects online status.
   */
  const syncAppointments = useCallback(async () => {
    const offline = await getOfflineAppointments();
    if (offline.length > 0) {
      try {
        await API.post("/sync", { appointments: offline });
        await clearOfflineAppointments();
        alert(t("offline.offlineSynced"));
        fetchAppointments();
      } catch (err) {
        console.log("Sync failed");
      }
    }
  }, [fetchAppointments, t]);

  /**
   * Get AI-powered appointment slot recommendation
   */
  const getAIRecommendation = async () => {
    setRecommendationLoading(true);
    try {
      const res = await API.post("/appointments/recommend", {
        patient_id: null, // Will be set from authenticated user
        symptoms: "chest pain" // Default for testing - can be enhanced with form input
      });

      setRecommendation(res.data);
      console.log("AI Recommendation:", res.data);
    } catch (err) {
      console.error("Error getting AI recommendation:", err);
      alert("Failed to get AI recommendation. Please try again.");
    } finally {
      setRecommendationLoading(false);
    }
  };

  /**
   * Use the AI recommended slot
   */
  const useRecommendedSlot = () => {
    if (recommendation && recommendation.recommended_slot) {
      setDate(recommendation.recommended_slot);
      setRecommendation(null); // Clear recommendation after use
    }
  };

  /**
   * Lifecycle:
   * - Fetch appointments on mount
   * - Add event listener for "online" to trigger sync
   * - Cleanup listener on unmount
   */
  useEffect(() => {
    fetchAppointments();
    window.addEventListener("online", syncAppointments);
    return () => window.removeEventListener("online", syncAppointments);
  }, [fetchAppointments, syncAppointments]);

  return (
    <div>
      <h2>{t("appointments.myAppointments")}</h2>

      {/* Booking form */}
      <div>
        <label>Date & Time:</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      
      <div>
        <label>Staff ID (Optional):</label>
        <input
          type="number"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          placeholder="Staff member ID"
        />
      </div>
      
      <div>
        <label>Clinic ID (Optional):</label>
        <input
          type="number"
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
          placeholder="Clinic ID"
        />
      </div>
      
      <div>
        <label>Urgency:</label>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
        >
          <option value="routine">Routine</option>
          <option value="moderate">Moderate</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <div style={{ margin: "10px 0" }}>
        <button 
          onClick={getAIRecommendation} 
          disabled={recommendationLoading}
          style={{ backgroundColor: "#4CAF50", color: "white" }}
        >
          {recommendationLoading ? "Getting AI Recommendation..." : "🤖 Get AI Recommendation"}
        </button>
        <button onClick={bookAppointment} style={{ marginLeft: "10px" }}>
          {t("appointments.bookAppointment")}
        </button>
      </div>

      {/* AI Recommendation Display */}
      {recommendation && (
        <div style={{ 
          margin: "15px 0", 
          padding: "15px", 
          backgroundColor: "#e8f5e8", 
          border: "1px solid #4CAF50", 
          borderRadius: "5px" 
        }}>
          <h4>🤖 AI Recommendation</h4>
          <p><strong>Recommended Slot:</strong> {new Date(recommendation.recommended_slot).toLocaleString()}</p>
          <p><strong>Urgency:</strong> 
            <span style={{ 
              color: recommendation.urgency === "urgent" ? "red" : 
                     recommendation.urgency === "moderate" ? "orange" : "green",
              fontWeight: "bold"
            }}>
              {recommendation.urgency}
            </span>
          </p>
          <p><strong>Reasoning:</strong> {recommendation.reasoning}</p>
          <p><strong>AI Confidence:</strong> {recommendation.ai_confidence}</p>
          <button 
            onClick={useRecommendedSlot}
            style={{ 
              backgroundColor: "#4CAF50", 
              color: "white", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            ✅ Use This Slot
          </button>
          <button 
            onClick={() => setRecommendation(null)}
            style={{ 
              backgroundColor: "#f44336", 
              color: "white", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "10px"
            }}
          >
            ❌ Dismiss
          </button>
        </div>
      )}

      {/* Appointments list */}
      {appointments.length === 0 ? (
        <p>No appointments found. Book your first appointment above!</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt.id}>
              <strong>{new Date(appt.date).toLocaleString()}</strong><br />
              Status: {appt.status} | Urgency: {appt.urgency || 'routine'}<br />
              {appt.staff_id && `Staff ID: ${appt.staff_id}`}<br />
              {appt.clinic_id && `Clinic ID: ${appt.clinic_id}`}<br />
              <button onClick={() => cancelAppointment(appt.id)}>
                {t("appointments.cancel")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
