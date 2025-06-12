import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { setToken } from '../utils/tokenStorage';
import { login } from '../services/api';
import { showAlert } from '../utils/alertMessage';
import defaultUser from '../assets/imgs/default_user.png';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(password);
}

export default function Login() {
    const router = useRouter();
    const [userData, setUserData] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!userData.trim()) newErrors.userData = "Username or Email is required";
        if (!password.trim()) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onLogin = async () => {
        if (!validate()) return;

        try {
            const res = await login(userData, password);
            await setToken(res.data.token);
            console.log('Token:', res.data.token);
            console.log('Role:', res.data.role);

            if (res.data.role === 'student') {
                router.replace('/student');
            } else if (res.data.role === 'coach') {
                router.replace('/coach');
            } else {
                showAlert('Login Failed', 'Unknown role');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Server error';
            showAlert('Login Failed', message);
        }
    };

    return (
        <View style={styles.background}>
            <View style={styles.formContainer}>

                {/* Default user image */}
                <Image
                    source={defaultUser}
                    style={styles.avatar}
                    resizeMode="cover"
                />

                {/* App Logo */}
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Login</Text>

                <CustomInput 
                    placeholder="Username or Email" 
                    value={userData} 
                    onChangeText={setUserData} 
                    error={errors.userData}
                />
                {errors.userData && <Text style={styles.errorText}>{errors.userData}</Text>}

                <View style={{ position: 'relative' }}>
                    <CustomInput 
                        placeholder="Password" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword}
                        error={errors.password}
                    />
                    <TouchableOpacity
                        style={styles.showHideBtn}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color="#1976d2"
                        />
                    </TouchableOpacity>
                </View>

                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <CustomButton title="Sign In" onPress={onLogin} style={styles.button} />

                <TouchableOpacity onPress={() => router.replace('/register')} style={styles.link}>
                    <Text style={styles.linkText}>Create an account? Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/forgot-pass')} style={styles.link}>
                    <Text style={styles.linkText}>Forgot password?</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#f4f8fb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#1976d2',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 18,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 22,
        textAlign: 'center',
        color: '#1976d2',
        letterSpacing: 1,
    },
    errorText: {
        color: 'red',
        fontSize: 13,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    button: {
        marginTop: 10,
        width: '100%',
        backgroundColor: '#1976d2',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    link: {
        marginTop: 16,
    },
    linkText: {
        color: '#1976d2',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
    },
    showHideBtn: {
        position: 'absolute',
        right: 12,
        top: 18,
        zIndex: 1,
        padding: 4,
    },
});
