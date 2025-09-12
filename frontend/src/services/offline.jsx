import localforage from "localforage";

localforage.config({
  name: "HealthcareApp",
  storeName: "appointments"
});

// Save unsynced appointment
export const saveOfflineAppointment = async (appointment) => {
  const list = (await localforage.getItem("offlineAppointments")) || [];
  list.push(appointment);
  await localforage.setItem("offlineAppointments", list);
};

// Get unsynced appointments
export const getOfflineAppointments = async () => {
  return (await localforage.getItem("offlineAppointments")) || [];
};

// Clear synced appointments
export const clearOfflineAppointments = async () => {
  await localforage.removeItem("offlineAppointments");
};
