import api from "./api"; // Uses your central axios instance

// 1. Get All Patients
export const getPatients = () => {
  return api.get("/patients");
};

// 2. Add New Patient
export const addPatient = (data) => {
  return api.post("/patients", data);
};

// 3. Dispense/Donate Blood
export const dispenseBlood = (id, data) => {
  return api.post(`/patients/${id}/dispense`, data);
};