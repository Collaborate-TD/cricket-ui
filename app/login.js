import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { setToken } from '../utils/tokenStorage';
import { login } from '../services/api';
import { showAlert } from '../utils/alertMessage';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = async () => {
        try {
            const res = await login(email, password);

            // Save token
            await setToken(res.data.token);
            console.log('Token:', res.data.token);

            // Use role from response
            console.log('Role:', res.data.role);

            if (res.data.role === 'student') {
                router.replace('/student');
            } else if (res.data.role === 'coach') {
                router.replace('/coach');
            } else {
                showAlert('Login Failed', 'Unknown role');
            }
        } catch (err) {
            // Axios error: err.response contains backend response
            const message = err.response?.data?.message || 'Server error';
            showAlert('Login Failed', message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            {/* If it is needed some platform specific */}
            {/* {Platform.OS === 'web' && <Text>You are using Web</Text>}
                    {Platform.OS === 'ios' && <Text>You're on iOS!</Text>} */}

            <CustomInput placeholder="Email / User Name" value={email} onChangeText={setEmail} />
            <CustomInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <CustomButton title="Sign In" onPress={onLogin} />
            <TouchableOpacity onPress={() => router.replace('/register')} style={styles.link}>
                <Text style={styles.linkText}>Create an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 5 },
    button: { backgroundColor: '#1976d2', padding: 15, borderRadius: 5 },
    buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
    link: { marginTop: 20 },
    linkText: { color: '#1976d2', textAlign: 'center' },
});

