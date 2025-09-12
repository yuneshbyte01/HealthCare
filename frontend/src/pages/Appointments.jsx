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
  const { t } = useTranslation();

  /**
   * Fetch all appointments from the backend.
   * Falls back to offline mode if network is unavailable.
   */
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log(t("offline.offlineFetchError"));
    }
  }, [t]);

  /**
   * Book a new appointment.
   * - If online: save directly to backend.
   * - If offline: store locally for later sync.
   */
  const bookAppointment = async () => {
    const newAppt = { date };
    try {
      const res = await API.post("/appointments", newAppt);
      setAppointments([...appointments, res.data]);
    } catch (err) {
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
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={bookAppointment}>{t("appointments.bookAppointment")}</button>

      {/* Appointments list */}
      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            {appt.date} - {appt.status}
            <button onClick={() => cancelAppointment(appt.id)}>
              {t("appointments.cancel")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
