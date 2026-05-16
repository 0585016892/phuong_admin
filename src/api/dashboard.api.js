import axiosClient from "./axiosClient";

export const dashboardApi = {
  getStats() {
    return axiosClient.get("/dashboard");
  },
};
