// filepath: cricket-ui/src/api.js
import axios from "axios";
import { API_URL } from '@env';


const API = axios.create({ baseURL: API_URL || 'http://127.0.1:5000' });

export const register = (email, password, role) =>
    API.post("/auth/register", { email, password, role });

export const login = (email, password) =>
    API.post("/auth/login", { userData : email, password });

export const fetchStudentData = (id) => API.get(`/students/${id}`);
export const fetchCoachData = (id) => API.get(`/coaches/${id}`);
export const getUserDetails = (id) => API.get(`/user/${id}`);
export const updateUser = (id, data) => API.put(`/user/${id}`, data);
// export const deleteUser = (id) => API.delete(`/user/delete`, { data: { id } });
export default API;