import axiosClient from "./axiosClient";

export const getCoupons = (params) => {
  return axiosClient.get("/coupons", { params });
};

export const createCoupon = (data) => {
  return axiosClient.post("/coupons", data);
};

export const updateCoupon = (id, data) => {
  return axiosClient.put(`/coupons/${id}`, data);
};

export const deleteCoupon = (id) => {
  return axiosClient.delete(`/coupons/${id}`);
};
