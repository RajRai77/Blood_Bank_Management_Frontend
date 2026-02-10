import API from "./api";

// 1. Get All Requests (Optional Filter: pending, approved, rejected)
export const getRequests = (status = "") => {
  return API.get(`/requests?status=${status}`);
};

// 2. Create New Request
export const createRequest = (data) => {
  return API.post("/requests", data);
};

// 3. Approve or Reject Request
export const updateRequestStatus = (id, status, deliveryData = null) => {
  return API.put(`/requests/${id}/status`, { status, deliveryDetails: deliveryData });
};
