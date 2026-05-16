import axiosClient from "./axiosClient";

export const getUsers = (params) =>
  axiosClient.get("/users", { params });

export const toggleUserStatus = (id, status) =>
  axiosClient.put(`/users/${id}/status`, { status });

export const updateUser = (id, data) =>
  axiosClient.put(`/users/${id}`, data);

export const deleteUser = (id) =>
  axiosClient.delete(`/users/${id}`);
export const createUser = (data) => 
    axiosClient.post("/users/register", data);