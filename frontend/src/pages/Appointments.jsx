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
  const [loading, setLoading] = useState(false); // loading state for AI
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
   * Ask backend AI service for suggested slot
   */
  const suggestSlot = async () => {
    if (!date) {
      alert("Please pick a preferred date first.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/ai/suggest-appointment", {
        preferred_date: date,
      });

      if (res.data.suggested_date) {
        const suggested = new Date(res.data.suggested_date).toLocaleString();
        if (window.confirm(`AI suggests: ${suggested}. Do you want to use it?`)) {
          setDate(res.data.suggested_date);
        }
      } else {
        alert("No AI suggestions available.");
      }
    } catch (err) {
      alert("AI service unavailable.");
    } finally {
      setLoading(false);
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
      
      <button onClick={suggestSlot} disabled={loading}>
        {loading ? "AI Suggesting..." : "AI Suggest"}
      </button>
      <button onClick={bookAppointment}>{t("appointments.bookAppointment")}</button>

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
