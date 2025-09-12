import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import {
  saveOfflineAppointment,
  getOfflineAppointments,
  clearOfflineAppointments,
} from "../services/offline";
import { useTranslation } from "react-i18next";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const { t } = useTranslation();

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log(t("offlineFetchError"));
    }
  }, [t]);

  // Book appointment
  const bookAppointment = async () => {
    const newAppt = { date };
    try {
      const res = await API.post("/appointments", newAppt);
      setAppointments([...appointments, res.data]);
    } catch (err) {
      console.log("Saving offline appointment");
      await saveOfflineAppointment(newAppt);
      alert(t("appointmentSavedOffline"));
    }
  };

  // Cancel appointment
  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert(t("cancelFailedOffline"));
    }
  };

  const syncAppointments = useCallback(async () => {
    const offline = await getOfflineAppointments();
    if (offline.length > 0) {
      try {
        await API.post("/sync", { appointments: offline });
        await clearOfflineAppointments();
        alert(t("offlineSynced"));
        fetchAppointments();
      } catch (err) {
        console.log("Sync failed");
      }
    }
  }, [fetchAppointments, t]);

  // useEffect now clean
  useEffect(() => {
    fetchAppointments();
    window.addEventListener("online", syncAppointments);
    return () => window.removeEventListener("online", syncAppointments);
  }, [fetchAppointments, syncAppointments]);

  return (
    <div>
      <h2>{t("myAppointments")}</h2>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={bookAppointment}>{t("bookAppointment")}</button>

      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            {appt.date} - {appt.status}
            <button onClick={() => cancelAppointment(appt.id)}>
              {t("cancel")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
