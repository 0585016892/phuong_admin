import axiosClient from "./axiosClient";

/* =========================
   GET LIST BOOKS
   params: page, limit, keyword, category_id, min_price, max_price, sort
========================= */
export const getBooks = async (params = {}) => {
  const res = await axiosClient.get("/books", { params });
  return res.data;
};

/* =========================
   GET BOOK DETAIL
========================= */
export const getBookById = async (id) => {
  const res = await axiosClient.get(`/books/${id}`);
  return res.data;
};

/* =========================
   CREATE BOOK
   data: FormData
========================= */
export const createBook = async (data) => {
  const res = await axiosClient.post("/books/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/* =========================
   UPDATE BOOK
   data: FormData
========================= */
export const updateBook = async (id, data) => {
  const res = await axiosClient.put(`/books/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const updateStatusBook = async (id, data) => {
  const res = await axiosClient.put(
    `/books/${id}/status`,
    data
  );
  return res.data;
};

/* =========================
   DELETE BOOK (SOFT)
========================= */
export const deleteBook = async (id) => {
  const res = await axiosClient.delete(`/books/${id}`);
  return res.data;
};