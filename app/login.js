import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { handleLogin } from '../controllers/authController';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { router } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = async () => {
        const res = await handleLogin(email, password);
        if (res.success) {
            Alert.alert('Success', `Logged in as ${res.data.role}`);
            // navigation logic based on role
        } else {
            Alert.alert('Login Failed', res.error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            {/* If it is needed some platform specific */}
            {/* {Platform.OS === 'web' && <Text>You are using Web</Text>}
                    {Platform.OS === 'ios' && <Text>You're on iOS!</Text>} */}

            <CustomInput placeholder="Email" value={email} onChangeText={setEmail} />
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