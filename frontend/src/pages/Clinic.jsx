import { useEffect, useState } from "react";
import API from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

/**
 * Clinic Component
 * Admin/Clinic dashboard:
 * - Displays all appointments
 * - Allows cancellation
 * - Shows a daily appointments chart
 */
export default function Clinic() {
  const [appointments, setAppointments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { t } = useTranslation();

  /**
   * Fetch all appointments from backend
   * Also prepares aggregated chart data (appointments per date).
   */
  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);

      // Aggregate appointments by date
      const counts = {};
      res.data.forEach((appt) => {
        const dateKey = new Date(appt.date).toLocaleDateString();
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      });

      // Convert to chart-friendly format
      const formatted = Object.keys(counts).map((date) => ({
        date,
        count: counts[date],
      }));

      setChartData(formatted);
    } catch (err) {
      console.log("Error fetching appointments", err);
    }
  };

  /**
   * Cancel an appointment by ID.
   * Updates state after successful deletion.
   */
  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert(t("appointments.cancelFailed"));
    }
  };

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>{t("clinic.clinicDashboard")}</h2>

      {/* Appointment List */}
      <h3>{t("clinic.allAppointments")}</h3>
      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            {appt.date} - {t("clinic.patient")} #{appt.patient_id} - {appt.status}
            <button onClick={() => cancelAppointment(appt.id)}>
              {t("appointments.cancel")}
            </button>
          </li>
        ))}
      </ul>

      {/* Daily Load Chart */}
      <h3>{t("clinic.dailyLoad")}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
