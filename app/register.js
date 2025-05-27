import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function Register() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    const onRegister = async () => {
        try {
            // Adjust your backend to accept these fields if needed
            await axios.post('http://192.168.2.15:5000/auth/register', {
                userName,
                firstName,
                lastName,
                email,
                password,
                role,
            });
            Alert.alert('Success', 'Registered successfully!');
            router.replace('/login');
        } catch (err) {
            Alert.alert('Registration Failed', err.response?.data?.message || 'Error registering');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <CustomInput placeholder="User Name" value={userId} onChangeText={setUserId} />
            <CustomInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <CustomInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <CustomInput placeholder="Email" value={email} onChangeText={setEmail} />
            <CustomInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
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