import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("nx_token");
      localStorage.removeItem("nx_user");
    }
    return Promise.reject(err);
  }
);

export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("nx_token");
  const res = await axios.post(`${BASE}/api/upload`, fd, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data;
};

export const login = async (username, password) => {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("nx_token", data.token);
  localStorage.setItem("nx_user", JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem("nx_token");
  localStorage.removeItem("nx_user");
};

export const getMe = () => {
  const raw = localStorage.getItem("nx_user");
  return raw ? JSON.parse(raw) : null;
};

export const getGames = () => api.get("/games").then((r) => r.data);
export const getGame = (slug) => api.get(`/games/${slug}`).then((r) => r.data);
export const listPosts = (params = {}) => api.get("/posts", { params }).then((r) => r.data);
export const getPost = (id) => api.get(`/posts/${id}`).then((r) => r.data);
export const createPost = (data) => api.post("/posts", data).then((r) => r.data);
export const updatePost = (id, data) => api.patch(`/posts/${id}`, data).then((r) => r.data);
export const deletePost = (id) => api.delete(`/posts/${id}`).then((r) => r.data);
export const analytics = () => api.get("/admin/analytics").then((r) => r.data);
