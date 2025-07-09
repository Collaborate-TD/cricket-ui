import axios from "axios";
import { API_URL } from '@env';

const API = axios.create({ baseURL: API_URL || 'http://127.0.0.1:5000' });

// const API = axios.create({ baseURL: API_URL });
// const BASE_URL = API_URL;

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
export const getVideos = (filter = {}) => API.post('/video/list', { params: filter });
export const uploadCaptureVideo = (formData) =>
    API.post('/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const uploadAnnotationFeedback = (formData) =>
    API.post('/videos/feedback', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const uploadGeneralFiles = (formData) =>
    API.post('/file/general-upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': '*/*',
        },
    });
export const uploadProfilePhotoAPI = (formData) =>
    API.post('/file/general-upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'User-Agent': 'PostmanRuntime/7.41.1',
        },
    });
export const toggleFavourite = (videoId, params) => {
    return API.put(`/video/${videoId}`, params);
};
export const uploadVideo = (formData) =>
    API.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
// Use axios for annotations
export const addAnnotation = (videoId, annotationData, token) =>
    API.post(`/video-ann/${videoId}/add`, annotationData, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getAnnotations = (videoId, token) =>
    API.get(`/video-ann/${videoId}/fetch`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// export const updateAnnotation = (videoId, annotationId, annotationData, token) =>
//     API.put(`/video-ann/${videoId}/annotations/${annotationId}`, annotationData, {
//         headers: { Authorization: `Bearer ${token}` }
//     });

// export const deleteAnnotation = (videoId, annotationId, token) =>
//     API.delete(`/video-ann/${videoId}/annotations/${annotationId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//     });

export const deleteVideos = (videoIds, userId) =>
    API.delete('/video/delete', { data: { ids: videoIds, userId } });

export const getDrills = (filter = {}) =>
    API.post('/drill/list', { params: filter });

export const getDrill = (id) =>
    API.get(`/drill/${id}`);

export const createDrill = (data) =>
    API.post('/drill/', data);

export const deleteDrills = (drillIds, userId) =>
    API.delete('/drill/', { data: { ids: drillIds, userId } });

export default API;