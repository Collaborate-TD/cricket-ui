// filepath: cricket-ui/src/api.js
import axios from "axios";
import { API_URL } from '@env';


const API = axios.create({ baseURL: API_URL || 'http://127.0.1:5000' });

export const register = (data) =>
    API.post("/auth/register", data);

export const login = (email, password) =>
    API.post("/auth/login", { userData: email, password });

export const fetchStudentData = (id) => API.get(`/students/${id}`);
export const fetchCoachData = (id) => API.get(`/coaches/${id}`);
export const getUserDetails = (id) => API.get(`/user/${id}`);
export const updateUser = (id, data) => API.put(`/user/${id}`, data);
export const getMatchUsers = (id) => API.post(`/user/${id}/matched`);
export const getStudents = () => API.post('/user/list', { role: 'student' });
export const requestCoach = (data) => API.post('/relation/request', data);
export const getUnmatchUsers = (studentId) => API.post(`/user/${studentId}/unmatched`);
export const getCoachProfile = (coachId) => API.get(`/user/details/${coachId}`);
export const getStudentRequests = (coachId) => API.get(`/relation/coach/${coachId}`);
export const handleUserRequest = (data) => API.post('/relation/action', data);
export const acceptStudentRequest = (data) => API.post('/relation/approve', data);
export const getMyStudents = (coachId) => API.get(`/my-students/${coachId}`);
export const getStudentProfile = (studentId) => API.get(`/user/details/${studentId}`);
export const getMyCoaches = (studentId) => API.get(`/my-coaches/${studentId}`);
// export const deleteUser = (id) => API.delete(`/user/delete`, { data: { id } });
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getVideos = (userId) => API.get(`/videos/${userId}`); // Adjust endpoint as per your backend
export const uploadVideo = (formData) =>
  API.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const uploadAnnotationFeedback = (formData) =>
  API.post('/videos/feedback', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export default API;