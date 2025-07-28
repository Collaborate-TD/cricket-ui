import { Platform } from 'react-native';
import { uploadProfilePhotoAPI } from '../services/api';

/**
 * Upload a profile photo to the backend.
 * @param {object} file - File object to be uploaded.
 * @returns {string|null} - Name of the uploaded file on the backend, or null on failure.
 */
export const uploadProfilePhoto = async (file) => {
    if (!file || !file.uri) return null;
    const formData = new FormData();
    let fileConfig;

    if (Platform.OS === 'web' && file.uri.startsWith('data:image')) {
        // Convert base64 to Blob
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

    try {
        const response = await uploadProfilePhotoAPI(formData);
        return response.data.files[0];
    } catch (err) {
        return null;
    }
};

/**
 * Upload a drill video to the backend temp folder.
 * @param {object} file - Video file object to be uploaded.
 * @returns {object|null} - { fileName: ... } on success, or null on failure.
 */
export const uploadDrillVideo = async (file) => {
    if (!file || !file.uri) return null;
    const formData = new FormData();
    let fileConfig;

    if (Platform.OS === 'web' && file.uri.startsWith('data:video')) {
        // Convert base64 to Blob
        const byteString = atob(file.uri.split(',')[1]);
        const mimeString = file.mimeType || file.type || 'video/mp4';
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ia], { type: mimeString });
        fileConfig = new File([blob], file.fileName || 'drill_video.mp4', { type: mimeString });
        formData.append('files', fileConfig);
    } else {
        fileConfig = {
            uri: file.uri,
            type: file.mimeType || file.type || 'video/mp4',
            name: file.fileName || 'drill_video.mp4',
        };
        formData.append('files', fileConfig);
    }

    try {
        const response = await uploadProfilePhotoAPI(formData);
        // Assuming API returns { files: [fileName] }
        return { fileName: response.data.files[0] };
    } catch (err) {
        return null;
    }
};