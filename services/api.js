// filepath: cricket-ui/src/api.js
import axios from "axios";
import { API_URL } from '@env';


const API = axios.create({ baseURL: API_URL || 'http://127.0.1:5000' });

export const register = (data) =>
    API.post("/auth/register", data);

export const login = (email, password) =>
    API.post("/auth/login", { userData : email, password });

export const fetchStudentData = (id) => API.get(`/students/${id}`);
export const fetchCoachData = (id) => API.get(`/coaches/${id}`);
export const getUserDetails = (id) => API.get(`/user/${id}`);
export const updateUser = (id, data) => API.put(`/user/${id}`, data);
export const getCoaches = () => API.post('/users/list', { role: 'coach' });
export const getStudents = () => API.post('/user/list', { role: 'student' });
export const requestCoach = (data) => API.post('/coach-requests', data);
export const getMyCoachRequests = (studentId) => API.get(`/coach-requests/student/${studentId}`);
export const getCoachProfile = (coachId) => API.get(`/user/details/${coachId}`);
export const getStudentRequests = (coachId) => API.get(`/coach-requests/coach/${coachId}`);
export const acceptStudentRequest = (requestId) => API.post(`/coach-requests/${requestId}/accept`);
export const declineStudentRequest = (requestId, feedback) => API.post(`/coach-requests/${requestId}/decline`, { feedback });
export const getMyStudents = (coachId) => API.get(`/my-students/${coachId}`);
export const getStudentProfile = (studentId) => API.get(`/user/details/${studentId}`);
export const getMyCoaches = (studentId) => API.get(`/my-coaches/${studentId}`);
// export const deleteUser = (id) => API.delete(`/user/delete`, { data: { id } });
export default API;