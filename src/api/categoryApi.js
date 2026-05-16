import axiosClient from "./axiosClient";

const API_URL = "/categories";

// Lấy danh sách + search
export const getCategories = (params) => {
  return axiosClient.get(API_URL, { params });
};

// Thêm danh mục
export const createCategory = (data) => {
  return axiosClient.post(API_URL, data);
};

// Cập nhật danh mục
export const updateCategory = (id, data) => {
  return axiosClient.put(`${API_URL}/${id}`, data);
};

// Xoá danh mục
export const deleteCategory = (id) => {
  return axiosClient.delete(`${API_URL}/${id}`);
};
