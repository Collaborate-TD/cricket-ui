import axios from "axios";
import { API_URL } from '@env';
import { Platform } from 'react-native';
import { getToken } from '../utils/tokenStorage';

//console.log('API_URL:', API_URL); // Debug
const API = axios.create({ baseURL: API_URL || 'http://127.0.0.1:5000' });

export const uploadProfilePhoto = async (file) => {
  if (!file || !file.uri) {
    //console.error('Invalid photo file:', file); // Debug
    return null;
  }
  const formData = new FormData();
  let fileConfig;

  if (Platform.OS === 'web' && file.uri.startsWith('data:image')) {
    // Convert base64 to Blob with improved handling
    const byteString = atob(file.uri.split(',')[1]);
    const mimeString = file.mimeType || file.type || 'image/png';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ia], { type: mimeString });
    fileConfig = new File([blob], file.fileName || 'avatar.png', { type: mimeString });
    formData.append('files', fileConfig);
  } else {
    fileConfig = {
      uri: file.uri,
      type: file.mimeType || file.type || 'image/jpeg',
      name: file.fileName || 'avatar.jpg',
    };
    formData.append('files', fileConfig);
  }

  //console.log('Uploading photo:', fileConfig); // Debug
  try {
    const response = await API.post('/file/general-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'PostmanRuntime/7.41.1', // Match Postman
      },
    });
    //console.log('Upload response:', response.data); // Debug
    return response.data.files[0].fileName;
  } catch (err) {
    //console.error('Upload error:', err.message, err.response?.data, err.config); // Debug
    return null;
  }
};

export const register = async (data, file) => {
  let profilePhotoFileName = null;
  if (file) {
    profilePhotoFileName = await uploadProfilePhoto(file);
    if (!profilePhotoFileName) {
      //console.warn('Photo upload failed, proceeding without profilePhoto'); // Debug
    }
  }
  const payload = {
    ...data,
    profilePhoto: profilePhotoFileName,
  };
  //console.log('Register payload:', payload); // Debug
  try {
    const response = await API.post('/auth/register', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    });
    //console.log('Register response:', response.data); // Debug
    return response;
  } catch (err) {
    //console.error('Register error:', err.message, err.response?.data, err.config); // Debug
    throw err;
  }
};

export const updateUser = async (id, data, file) => {
  let profilePhotoFileName = data.profilePhoto;
  if (file) {
    profilePhotoFileName = await uploadProfilePhoto(file);
  }
  const payload = { ...data, profilePhoto: profilePhotoFileName };
  const token = await getToken();
  //console.log('Update payload:', payload); // Debug
  try {
    const response = await API.put(`/user/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    });
    //console.log('Update response:', response.data); // Debug
    return response;
  } catch (err) {
    //console.error('Update error:', err.message, err.response?.data); // Debug
    throw err;
  }
};

export const login = (userData, password) =>
  API.post('/auth/login', { userData, password });

export const fetchStudentData = (id) => API.get(`/students/${id}`);
export const fetchCoachData = (id) => API.get(`/coaches/${id}`);
export const getUserDetails = (id) => API.get(`/user/${id}`);
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
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getVideos = (filter = {}) => API.post('/video/list', { params: filter });
export const uploadVideo = (formData) =>
  API.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const uploadAnnotationFeedback = (formData) =>
  API.post('/videos/feedback', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default API;