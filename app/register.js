import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { handleRegister } from '../controllers/authController';
import { ROLES } from '../constants/roles';
import { router } from 'expo-router';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES.STUDENT);

    const onRegister = async () => {
        try {
            const res = await handleRegister(email, password, role);
            Alert.alert('Success', res.data.message || 'Registered successfully');
            router.replace('/login');
        } catch (err) {
            Alert.alert('Registration Failed', err.response?.data?.message || 'Error registering');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <CustomInput placeholder="Email" value={email} onChangeText={setEmail} />
            <CustomInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <CustomInput placeholder="Role (student or coach)" value={role} onChangeText={setRole} />
            <CustomButton title="Create Account" onPress={onRegister} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    link: { marginTop: 20 },
    linkText: { color: '#1976d2', textAlign: 'center' },
});