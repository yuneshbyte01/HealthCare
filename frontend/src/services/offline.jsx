import localforage from "localforage";

/**
 * LocalForage Configuration
 * Creates a local storage instance for offline appointment handling.
 */
localforage.config({
  name: "HealthcareApp",
  storeName: "appointments"
});

/**
 * Save a new appointment to offline storage.
 * Used when the device is offline.
 */
export const saveOfflineAppointment = async (appointment) => {
  const list = (await localforage.getItem("offlineAppointments")) || [];
  list.push(appointment);
  await localforage.setItem("offlineAppointments", list);
};

/**
 * Retrieve all unsynced appointments from offline storage.
 */
export const getOfflineAppointments = async () => {
  return (await localforage.getItem("offlineAppointments")) || [];
};

/**
 * Clear all offline appointments after successful sync.
 */
export const clearOfflineAppointments = async () => {
  await localforage.removeItem("offlineAppointments");
};
