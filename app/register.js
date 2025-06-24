import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import { useRouter } from 'expo-router';
import { register } from '../services/api';
import { showAlert } from '../utils/alertMessage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import logo from '../assets/logo.png'; // Replace with your logo path
import { uploadFile } from '../utils/fileUpload';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
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
    const [photo, setPhoto] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!userId) newErrors.userName = 'User name is required';
        if (!firstName) newErrors.firstName = 'First name is required';
        if (!lastName) newErrors.lastName = 'Last name is required';
        if (!email) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Invalid email address';
        if (!password) newErrors.password = 'Password is required';
        else if (!validatePassword(password))
            newErrors.password =
                'Password must be at least 6 characters, include a number and a special character';
        if (!role) newErrors.role = 'Role is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onRegister = async () => {
        if (!validate()) return;
        try {
            let profilePhoto = null;
            if (photo) {
                const uploaded = await uploadFile(photo);
                profilePhoto = uploaded ? uploaded.path.replace(/\\/g, '/') : null;
            }
            const data = {
                userName: userId,
                firstName,
                lastName,
                email,
                password,
                role,
                profilePhoto, // use backend link if available
            };
            await register(data);
            showAlert('Success', 'Registered successfully!');
            router.replace('/login');
        } catch (err) {
            //console.error('Registration error:', err.message, err.response?.data); // Debug
            showAlert(
                'Registration Failed',
                err.response?.data?.message || 'Error registering'
            );
        }
    };

    return (
        <View style={styles.background}>
            <View style={styles.card}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
                <Text style={styles.title}>Create Account</Text>
                <ProfilePhotoUploader
                    photoUri={photo?.uri}
                    setPhoto={setPhoto}
                    defaultImage={require('../assets/default-user.png')}
                />
                <View style={styles.inputWrapper}>
                    <CustomInput
                        placeholder="User Name"
                        value={userId}
                        onChangeText={setUserId}
                    />
                    {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
                </View>
                <View style={styles.inputWrapper}>
                    <CustomInput
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                </View>
                <View style={styles.inputWrapper}>
                    <CustomInput
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                </View>
                <View style={styles.inputWrapper}>
                    <CustomInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
                <View style={styles.passwordWrapper}>
                    <CustomInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        inputStyle={styles.passwordInput}
                    />
                    <TouchableOpacity
                        style={styles.showHideBtn}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color="#1976d2"
                        />
                    </TouchableOpacity>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>
                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={role === 'student' ? styles.roleButtonSelected : styles.roleButton}
                        onPress={() => setRole('student')}
                    >
                        <Text
                            style={role === 'student' ? styles.roleButtonTextSelected : styles.roleButtonText}
                        >
                            Student
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={role === 'coach' ? styles.roleButtonSelected : styles.roleButton}
                        onPress={() => setRole('coach')}
                    >
                        <Text
                            style={role === 'coach' ? styles.roleButtonTextSelected : styles.roleButtonText}
                        >
                            Coach
                        </Text>
                    </TouchableOpacity>
                </View>
                <CustomButton
                    title="Create Account"
                    onPress={onRegister}
                    style={styles.button}
                />
                <TouchableOpacity onPress={() => router.replace('/login')} style={styles.link}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
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
    card: {
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
    logo: {
        width: 120,
        height: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 22,
        textAlign: 'center',
        color: '#1976d2',
        letterSpacing: 1,
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 12,
    },
    passwordWrapper: {
        width: '100%',
        marginBottom: 12,
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 40,
    },
    errorText: {
        color: 'red',
        fontSize: 13,
        marginTop: 4,
        marginLeft: 4,
    },
    showHideBtn: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -20 }],
        zIndex: 1,
        padding: 4,
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
        marginTop: 18,
    },
    linkText: {
        color: '#1976d2',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    roleButton: {
        borderWidth: 1,
        borderColor: '#1976d2',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 5,
        marginTop: 10,
    },
    roleButtonSelected: {
        borderWidth: 1,
        borderColor: '#1976d2',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 5,
        marginTop: 10,
        backgroundColor: '#1976d2',
    },
    roleButtonText: {
        color: '#1976d2',
        fontSize: 16,
        fontWeight: 'bold',
    },
    roleButtonTextSelected: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});