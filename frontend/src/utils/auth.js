export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
