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
            {/* <CustomInput placeholder="Role (student or coach)" value={role} onChangeText={setRole} /> */}
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