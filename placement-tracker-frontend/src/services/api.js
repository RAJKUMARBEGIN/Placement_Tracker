import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getUserById: (id) => api.get(`/auth/user/${id}`),
  updateProfile: (id, data) => api.put(`/auth/user/${id}/profile`, data),
  getAllMentors: () => api.get("/auth/mentors"),
  getPendingMentors: () => api.get("/auth/mentors/pending"),
  getAllMentorsIncludingPending: () => api.get("/auth/mentors/all"),
  approveMentor: (id) => api.put(`/auth/mentors/${id}/approve`),
  rejectMentor: (id) => api.delete(`/auth/mentors/${id}/reject`),
  getMentorsByDepartment: (departmentId) =>
    api.get(`/auth/mentors/department/${departmentId}`),
  getMentorsByCompany: (companyName) =>
    api.get(`/auth/mentors/company?companyName=${companyName}`),
  updateUser: (id, data) => api.put(`/auth/user/${id}`, data),
  convertToMentor: (id, data) =>
    api.put(`/auth/user/${id}/convert-to-mentor`, data),
  // OTP verification
  sendOTP: (email) => api.post("/auth/send-otp", { email }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  checkGCTEmail: (email) => api.get(`/auth/check-gct-email?email=${email}`),
  // Mentor verification code
  sendMentorVerificationCode: (email) =>
    api.post("/auth/mentors/send-verification-code", { email }),
  verifyMentorCode: (email, verificationCode) =>
    api.post("/auth/mentors/verify-code", { email, verificationCode }),
};

// Forgot Password APIs
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);

// Department APIs
export const departmentAPI = {
  getAll: () => api.get("/departments"),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post("/departments", data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  getRelated: (id) => api.get(`/departments/${id}/related`),
  getByGroup: (group) => api.get(`/departments/group/${group}`),
};

// Company APIs
export const companyAPI = {
  getAll: () => api.get("/companies"),
  getById: (id) => api.get(`/companies/${id}`),
  getByName: (name) => api.get(`/companies/name/${name}`),
  create: (data, userId) =>
    api.post(`/companies${userId ? `?userId=${userId}` : ""}`, data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
  search: (query) => api.get(`/companies/search?query=${query}`),
  exists: (companyName) =>
    api.get(`/companies/exists?companyName=${companyName}`),
};

// Interview Experience APIs
export const experienceAPI = {
  getAll: () => api.get("/experiences"),
  getById: (id) => api.get(`/experiences/${id}`),
  create: (data) => api.post("/experiences", data),
  update: (id, data) => api.put(`/experiences/${id}`, data),
  delete: (id) => api.delete(`/experiences/${id}`),
  getByDepartment: (departmentId) =>
    api.get(`/experiences/department/${departmentId}`),
  searchByCompany: (companyName) =>
    api.get(`/experiences/search/company?companyName=${companyName}`),
  getByYear: (year) => api.get(`/experiences/year/${year}`),
  getMentors: () => api.get("/experiences/mentors"),
  getByDepartmentAndYear: (departmentId, year) =>
    api.get(`/experiences/department/${departmentId}/year/${year}`),
};

// Placement Experience APIs (new comprehensive format)
export const placementAPI = {
  getAll: () => api.get("/placement-experiences"),
  getById: (id) => api.get(`/placement-experiences/${id}`),
  create: (data) => api.post("/placement-experiences", data),
  update: (id, data) => api.put(`/placement-experiences/${id}`, data),
  delete: (id) => api.delete(`/placement-experiences/${id}`),
  searchByCompany: (name) =>
    api.get(`/placement-experiences/search/company?name=${name}`),
  searchByDepartment: (name) =>
    api.get(`/placement-experiences/search/department?name=${name}`),
  filterByResult: (result) =>
    api.get(`/placement-experiences/filter/result?result=${result}`),
  getGroupedByCompany: () => api.get("/placement-experiences/grouped/company"),
  getByCompanyGroupedByYear: (companyName) =>
    api.get(`/placement-experiences/company/${companyName}`),
};

// Admin APIs
export const adminAPI = {
  login: (data) => api.post("/admin/login", data),
  createAdmin: (data) => api.post("/admin/create", data),
  getById: (id) => api.get(`/admin/${id}`),
  // Mentor management
  createMentor: (data) => api.post("/admin/mentors", data),
  updateMentor: (id, data) => api.put(`/admin/mentors/${id}`, data),
  deleteMentor: (id) => api.delete(`/admin/mentors/${id}`),
  getAllMentors: () => api.get("/admin/mentors"),
  getMentorById: (id) => api.get(`/admin/mentors/${id}`),
  getMentorsByDepartment: (departmentId) =>
    api.get(`/admin/mentors/department/${departmentId}`),
  getMentorsByCompany: (companyName) =>
    api.get(`/admin/mentors/company?companyName=${companyName}`),
  // User management (students and all users)
  getAllUsers: () => api.get("/admin/users"),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/activate`),
};

export default api;
