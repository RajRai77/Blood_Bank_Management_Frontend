import API from "./api";

export const getStats = () => API.get("/inventory/stats");
export const getRecentActivity = () => API.get("/inventory/recent");

// FIX: Default 'filters' to {} so it doesn't crash when called without arguments
export const getInventory = (filters = {}) => {
  
  // Remove empty keys to clean up the URL
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== "")
  );
  
  // FIX: Use 'cleanFilters' here, not the original 'filters'
  const query = new URLSearchParams(cleanFilters).toString();
  
  return API.get(`/inventory?${query}`); 
};

export const deleteInventoryItem = (id) => {
  return API.delete(`/inventory/${id}`);
};

export const addInventory = (data) => API.post("/inventory/add", data);

export const getCertificate = (donorId) => API.get(`/inventory/certificate/${donorId}`);