import API from "./api";

export const login = async (credentials) => {
  const response = await API.post("/users/login", credentials);
  if (response.data.data.accessToken) {
    localStorage.setItem("accessToken", response.data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export const logout = async () => {
  await API.post("/users/logout");
  localStorage.clear();
};

export const register = (data) => API.post("/users/register", data); // New
export const getHospitalsList = () => API.get("/users/hospitals"); // New

export const getCurrentUser = () => API.get("/users/current-user");