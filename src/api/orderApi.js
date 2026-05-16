// src/api/orderApi.js
import axiosClient from "./axiosClient";

export const getOrders = (params) =>
  axiosClient.get("/orders", { params });

export const getOrderDetail = (id) =>
  axiosClient.get(`/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  axiosClient.put(`/orders/${id}/status`, { status });
