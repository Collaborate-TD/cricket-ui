import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { getToken } from '../utils/tokenStorage'; // adjust path if needed


export default function PersonalInfo() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get token from storage
        const token = await getToken();
        
        if (!token) throw new Error('No token found');
        // 2. Decode token to get user info
        const user = jwtDecode(token);
        setUserId(user.userId); // or user.id, depending on your backend

        // 3. Fetch user data from API
        const res = await axios.get(`http://192.168.2.15:5000/api/user/details/${user.userId}`);
        setFirstName(res.data.firstName);
        setUserName(res.data.userName);
        setEmail(res.data.email);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSave = async () => {
    try {
      await axios.put(`http://192.168.2.15:5000/api/users/${userId}`, {
        firstName,
        userName,
      });
      Alert.alert('Success', 'Information updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update information');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Personal Information</Text>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={styles.label}>User Name</Text>
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee', color: '#888' }]}
        value={email}
        editable={false}
      />
      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 1 },
  backText: { fontSize: 32, color: '#1976d2' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 60, marginBottom: 32, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 6, marginTop: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});