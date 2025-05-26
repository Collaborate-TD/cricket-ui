import { login, register } from '../services/api';

export const handleLogin = async (email, password) => {
    try {
        const response = await login(email, password);
        return { success: true, data: response.data };
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.message || "Login failed",
        };
    }
};

export const handleRegister = async (email, password, role) => {
    try {
        const response = await register(email, password, role);
        return { success: true, data: response.data };
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.message || "Registration failed",
        };
    }
};
