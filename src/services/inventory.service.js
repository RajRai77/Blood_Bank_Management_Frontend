import API from "./api";

export const getStats = () => API.get("/inventory/stats");
export const getRecentActivity = () => API.get("/inventory/recent");

// Supports filtering by Component Type (Plasma/RBC)
export const getInventory = (filters) => {
  // filters = { bloodGroup: 'A+', inventoryType: 'Plasma' }

  // Remove empty keys to clean up the URL
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== "")
  );
  
  const query = new URLSearchParams(filters).toString();
  return API.get(`/inventory?${query}`); 
};

export const addStock = (data) => API.post("/inventory/add", data);

export const getCertificate = (donorId) => API.get(`/inventory/certificate/${donorId}`);