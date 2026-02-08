import API from "./api";

export const getStats = () => API.get("/inventory/stats");
export const getRecentActivity = () => API.get("/inventory/recent");

// Supports filtering by Component Type (Plasma/RBC)
export const getInventory = (filters) => {
  // filters = { bloodGroup: 'A+', inventoryType: 'Plasma' }
  const query = new URLSearchParams(filters).toString();
  return API.get(`/inventory?${query}`); 
};

export const addStock = (data) => API.post("/inventory/add", data);

export const getCertificate = (donorId) => API.get(`/inventory/certificate/${donorId}`);