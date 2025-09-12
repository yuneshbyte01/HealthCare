import { useEffect, useState } from "react";
import API from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

export default function Clinic() {
  const [appointments, setAppointments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { t } = useTranslation();

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);

      // Prepare chart data (appointments per date)
      const counts = {};
      res.data.forEach((appt) => {
        const dateKey = new Date(appt.date).toLocaleDateString();
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      });

      const formatted = Object.keys(counts).map((date) => ({
        date,
        count: counts[date],
      }));

      setChartData(formatted);
    } catch (err) {
      console.log("Error fetching appointments", err);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      alert(t("cancelFailed")); // ✅ translated alert
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>{t("clinicDashboard")}</h2>

      {/* Appointment List */}
      <h3>{t("allAppointments")}</h3>
      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            {appt.date} - {t("patient")} #{appt.patient_id} - {appt.status}
            <button onClick={() => cancelAppointment(appt.id)}>
              {t("cancel")}
            </button>
          </li>
        ))}
      </ul>

      {/* Chart */}
      <h3>{t("dailyLoad")}</h3>
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
