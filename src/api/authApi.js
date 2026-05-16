import axiosClient from "./axiosClient";

export const authApi = {
  login(data) {
    return axiosClient.post("/users/loginadmin", data);
  },

  me() {
    return axiosClient.get("/users/me");
  },
};
