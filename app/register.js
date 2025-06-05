import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import { register } from '../services/api';
import { showAlert } from '../utils/alertMessage';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    // At least 6 chars, one number, one special char
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(password);
}

export default function Register() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!userId) newErrors.userName = "User name is required";
        if (!firstName) newErrors.firstName = "First name is required";
        if (!lastName) newErrors.lastName = "Last name is required";
        if (!email) newErrors.email = "Email is required";
        else if (!validateEmail(email)) newErrors.email = "Invalid email address";
        if (!password) newErrors.password = "Password is required";
        else if (!validatePassword(password)) newErrors.password = "Password must be at least 6 characters, include a number and a special character";
        if (!role) newErrors.role = "Role is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onRegister = async () => {
        if (!validate()) return;
        try {
            // Adjust your backend to accept these fields if needed
            const data = {
                userName: userId,
                firstName,
                lastName,
                email,
                password,
                role,
            };
            await register(data);
            showAlert('Success', 'Registered successfully!');
            router.replace('/login');
        } catch (err) {
            showAlert('Registration Failed', err.response?.data?.message || 'Error registering');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <CustomInput
                placeholder="User Name"
                value={userId}
                onChangeText={setUserId}
            />
            {errors.userName && <Text style={{color: 'red'}}>{errors.userName}</Text>}
            <CustomInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />
            {errors.firstName && <Text style={{color: 'red'}}>{errors.firstName}</Text>}
            <CustomInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
            />
            {errors.lastName && <Text style={{color: 'red'}}>{errors.lastName}</Text>}
            <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            {errors.email && <Text style={{color: 'red'}}>{errors.email}</Text>}
            <CustomInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {errors.password && <Text style={{color: 'red'}}>{errors.password}</Text>}
            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[
                        styles.roleButton,
                        role === 'student' && styles.roleButtonSelected,
                    ]}
                    onPress={() => setRole('student')}
                >
                    <Text
                        style={[
                            styles.roleButtonText,
                            role === 'student' && styles.roleButtonTextSelected,
                        ]}
                    >
                        Student
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.roleButton,
                        role === 'coach' && styles.roleButtonSelected,
                    ]}
                    onPress={() => setRole('coach')}
                >
                    <Text
                        style={[
                            styles.roleButtonText,
                            role === 'coach' && styles.roleButtonTextSelected,
                        ]}
                    >
                        Coach
                    </Text>
                </TouchableOpacity>
            </View>
            <CustomButton title="Create Account" onPress={onRegister} />
            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.link}>
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
    roleButton: {
        borderWidth: 1,
        borderColor: '#1976d2',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 5,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    roleButtonSelected: {
        backgroundColor: '#1976d2',
    },
    roleButtonText: {
        color: '#1976d2',
        fontSize: 16,
        fontWeight: 'bold',
    },
    roleButtonTextSelected: {
        color: '#fff',
    },
});