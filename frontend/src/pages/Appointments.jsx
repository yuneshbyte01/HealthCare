import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import {
  saveOfflineAppointment,
  getOfflineAppointments,
  clearOfflineAppointments,
} from "../services/offline";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");

  // ✅ Wrap fetchAppointments in useCallback
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log("Offline mode - could not fetch");
    }
  }, []);

  // Book appointment
  const bookAppointment = async () => {
    const newAppt = { date };
    try {
      const res = await API.post("/appointments", newAppt);
      setAppointments([...appointments, res.data]);
    } catch (err) {
      console.log("Saving offline appointment");
      await saveOfflineAppointment(newAppt);
      alert("Appointment saved offline, will sync later.");
    }
  };

  // Cancel appointment
  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert("Could not cancel appointment (offline mode).");
    }
  };

  // ✅ Wrap syncAppointments in useCallback, depends on fetchAppointments
  const syncAppointments = useCallback(async () => {
    const offline = await getOfflineAppointments();
    if (offline.length > 0) {
      try {
        await API.post("/sync", { appointments: offline });
        await clearOfflineAppointments();
        alert("Offline appointments synced!");
        fetchAppointments();
      } catch (err) {
        console.log("Sync failed");
      }
    }
  }, [fetchAppointments]);

  // useEffect now clean
  useEffect(() => {
    fetchAppointments();
    window.addEventListener("online", syncAppointments);
    return () => window.removeEventListener("online", syncAppointments);
  }, [fetchAppointments, syncAppointments]);

  return (
    <div>
      <h2>My Appointments</h2>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={bookAppointment}>Book Appointment</button>

      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            {appt.date} - {appt.status}
            <button onClick={() => cancelAppointment(appt.id)}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
