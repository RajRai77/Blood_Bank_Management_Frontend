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

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};