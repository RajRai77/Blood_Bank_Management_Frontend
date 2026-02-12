import api from "./api"; // Uses your central axios instance

// 1. Get All Camps
export const getCamps = () => {
  return api.get("/camps");
};

// 2. Schedule New Camp
export const createCamp = (data) => {
  return api.post("/camps", data);
};

// 3. Register Donor (Public)
export const registerDonor = (campId, data) => {
  // We use the public instance if you have one, or the standard one is fine
  // Since we made the route public, it won't fail even if token is missing
  return api.post(`/camps/${campId}/register`, data);
};

// 4. Update Donor Status (Screening/Collection)
export const updateDonorStatus = (campId, donorId, data) => {
  return api.put(`/camps/${campId}/donor/${donorId}`, data);
};