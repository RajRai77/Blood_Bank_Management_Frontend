import api from "./api"; // Your Axios instance

export const getRequests = (filter) => {
  return api.get(`/requests?status=${filter || ""}`);
};

export const createRequest = (data) => {
  return api.post("/requests", data);
};

// --- FIX THIS FUNCTION ---
export const updateRequestStatus = (id, status, deliveryDetails, paymentDetails) => {
  return api.put(`/requests/${id}/status`, { 
      status, 
      deliveryDetails, 
      paymentDetails // <--- ENSURE THIS IS HERE
  });
};

export const submitPayment = (id, paymentData) => {
    // api.put automatically handles base URL and credentials
    return api.put(`/requests/${id}/payment`, paymentData);
};

export const verifyDeliveryOTP = (id, otp) => {
    return api.post(`/requests/${id}/verify-otp`, { otp });
}