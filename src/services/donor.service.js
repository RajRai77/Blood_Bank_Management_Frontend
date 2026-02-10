import API from "./api";

// 1. Get All Donors (With Search support)
export const getDonors = (query = "") => {
  return API.get(`/donors?search=${query}`);
};

// 2. Register New Donor
export const registerDonor = (data) => {
  return API.post("/donors/register", data);
};

// 3. Get Single Donor Details
export const getDonorById = (id) => {
  return API.get(`/donors/${id}`);
};

// 4. Update Donor
export const updateDonor = (id, data) => {
  return API.put(`/donors/${id}`, data);
};

// 5. Delete Donor
export const deleteDonor = (id) => {
  return API.delete(`/donors/${id}`);
};