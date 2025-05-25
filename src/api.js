// filepath: cricket-ui/src/api.js
import axios from "axios";

const API = axios.create({ baseURL: "http://192.168.2.15:5000" });

export const register = (email, password, role) =>
  API.post("/auth/register", { email, password, role });

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const fetchStudentData = (id) => API.get(`/students/${id}`);
export const fetchCoachData = (id) => API.get(`/coaches/${id}`);