import axios from "axios";
import { Blog, Comment, CommentWithBlog, PaginatedResponse } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// attach token for admin requests
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

function authHeader(token: string): { headers: { Authorization: string } } {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// Public
export const getBlogs = (page = 1, search = "") =>
  api.get<PaginatedResponse<Blog>>("/blogs", { params: { page, search } }).then((r) => r.data);

export const getBlogBySlug = (slug: string) =>
  api.get<Blog>(`/blogs/${slug}`).then((r) => r.data);

export const postComment = (blogId: string, data: { senderName: string; message: string }) =>
  api.post<Comment>(`/blogs/${blogId}/comments`, data).then((r) => r.data);

// Admin - Auth
export const adminLogin = (email: string, password: string) =>
  api.post<{ token: string; user: { id: string; email: string; role: string } }>("/auth/login", { email, password }).then((r) => r.data);

// Admin - Blogs
export const adminGetBlogs = (page = 1, token?: string) =>
  api.get<PaginatedResponse<Blog>>("/admin/blogs", { params: { page }, ...(token ? authHeader(token) : {}) }).then((r) => r.data);

export const adminGetBlogById = (id: string, token?: string) =>
  api.get<Blog>(`/admin/blogs/${id}`, token ? authHeader(token) : {}).then((r) => r.data);

export const adminCreateBlog = (data: Partial<Blog>, token?: string) =>
  api.post<Blog>("/admin/blogs", data, token ? authHeader(token) : {}).then((r) => r.data);

export const adminUpdateBlog = (id: string, data: Partial<Blog>, token?: string) =>
  api.patch<Blog>(`/admin/blogs/${id}`, data, token ? authHeader(token) : {}).then((r) => r.data);

export const adminDeleteBlog = (id: string, token?: string) =>
  api.delete(`/admin/blogs/${id}`, token ? authHeader(token) : {}).then((r) => r.data);

export const adminUploadCover = (id: string, file: File, token?: string) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<Blog>(`/admin/blogs/${id}/cover`, form, token ? authHeader(token) : {}).then((r) => r.data);
};

export const adminUploadImage = (id: string, file: File, token?: string) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/admin/blogs/${id}/images`, form, token ? authHeader(token) : {}).then((r) => r.data);
};

export const adminDeleteImage = (blogId: string, imageId: string, token?: string) =>
  api.delete(`/admin/blogs/${blogId}/images/${imageId}`, token ? authHeader(token) : {}).then((r) => r.data);

// Admin - Comments
export const adminGetComments = (page = 1, status?: string, token?: string) =>
  api.get<PaginatedResponse<CommentWithBlog>>("/admin/comments", { params: { page, status }, ...(token ? authHeader(token) : {}) }).then((r) => r.data);

export const adminApproveComment = (id: string, token?: string) =>
  api.patch<Comment>(`/admin/comments/${id}/approve`, {}, token ? authHeader(token) : {}).then((r) => r.data);

export const adminRejectComment = (id: string, token?: string) =>
  api.patch<Comment>(`/admin/comments/${id}/reject`, {}, token ? authHeader(token) : {}).then((r) => r.data);

export const adminDeleteComment = (id: string, token?: string) =>
  api.delete(`/admin/comments/${id}`, token ? authHeader(token) : {}).then((r) => r.data);

export default api;
