import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (id, data) => api.put(`/auth/update/${id}`, data),
  uploadProfilePicture: (id, formData) => {
    return api.post(`/auth/upload-profile-picture/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteProfile: (id) => api.delete(`/auth/delete/${id}`),
  getUsers: () => api.get("/auth/users"),
};

// Cases API
export const casesAPI = {
  getCases: () => api.get("/case"),
  getCaseById: (id) => api.get(`/case/${id}`),
  fileCase: (caseData) => api.post("/case/file", caseData),
  assignCase: (caseId, judgeId) =>
    api.put(`/case/assign/${caseId}`, { judgeId }),
  updateCaseStatus: (id, status) => api.put(`/case/status/${id}`, { status }),
  deleteCase: (id) => api.delete(`/case/${id}`),
};

// Hearings API
export const hearingsAPI = {
  getHearings: () => api.get("/hearings"),
  getHearingById: (id) => api.get(`/hearings/${id}`),
  createHearing: (caseId, hearingData) =>
    api.post(`/hearings/create/${caseId}`, hearingData),
  updateHearing: (id, hearingData) =>
    api.put(`/hearings/update/${id}`, hearingData),
  deleteHearing: (id) => api.delete(`/hearings/${id}`),
};

// Courts API
export const courtsAPI = {
  getCourts: () => api.get("/court/courts"),
  createCourt: (courtData) => api.post("/court/create", courtData),
};

// Reports API
export const reportsAPI = {
  getReports: () => api.get("/report/reports"),
  getReportById: (id) => api.get(`/report/report/${id}`),
  createReport: (reportData) => api.post("/report/create", reportData),
  deleteReport: (id) => api.delete(`/report/delete/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications/getNotifications"),
  sendNotification: (notificationData) =>
    api.post("/notifications/send", notificationData),
  markAsRead: (id) => api.put(`/notifications/read/${id}`),
};

// Documents API
export const documentsAPI = {
  uploadDocuments: (caseId, formData) => {
    return api.post(`/documents/upload/${caseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getCaseDocuments: (caseId) => api.get(`/documents/case/${caseId}`),
  viewDocument: (caseId, filename) =>
    api.get(`/documents/view/${caseId}/${filename}`, {
      responseType: "blob",
    }),
  downloadDocument: (caseId, filename) =>
    api.get(`/documents/view/${caseId}/${filename}?download=true`, {
      responseType: "blob",
    }),
  deleteDocument: (documentId) => api.delete(`/documents/${documentId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardAnalytics: () => api.get("/analytics/dashboard"),
  getCaseTrends: (year) =>
    api.get(`/analytics/case-trends${year ? `?year=${year}` : ""}`),
};

export default api;
