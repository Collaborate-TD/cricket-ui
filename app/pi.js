import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { getToken } from '../utils/tokenStorage';

export default function PersonalInfo() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [editFullName, setEditFullName] = useState(false);
  const [editUserName, setEditUserName] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token found');
        const user = jwtDecode(token);
        setUserId(user.id || user.userId || user._id);

        const res = await axios.get(`http://127.0.0.1:5000/api/user/details/${user.id || user.userId || user._id}`);
        setFirstName(res.data.firstName || '');
        setLastName(res.data.lastName || '');
        setUserName(res.data.userName || '');
        setEmail(res.data.email || '');
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
      await axios.put(`http://127.0.0.1:5000/api/users/${userId}`, {
        firstName,
        lastName,
        userName,
      });
      Alert.alert('Success', 'Information updated!');
      setEditFullName(false);
      setEditUserName(false);
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
      <TouchableOpacity
  style={styles.backButton}
  onPress={() => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/coach'); // or your desired fallback route
    }
  }}
>
  <Text style={styles.backText}>←</Text>
</TouchableOpacity>
      <Text style={styles.title}>Personal Information</Text>

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <View style={styles.row}>
        {editFullName ? (
          <>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
            />
            <TouchableOpacity onPress={() => setEditFullName(false)}>
              <Text style={styles.editText}>✔️</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.valueText, { flex: 1 }]}>{firstName} {lastName}</Text>
            <TouchableOpacity onPress={() => setEditFullName(true)}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* User Name */}
      <Text style={styles.label}>User Name</Text>
      <View style={styles.row}>
        {editUserName ? (
          <>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={userName}
              onChangeText={setUserName}
              placeholder="User Name"
            />
            <TouchableOpacity onPress={() => setEditUserName(false)}>
              <Text style={styles.editText}>✔️</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.valueText, { flex: 1 }]}>{userName}</Text>
            <TouchableOpacity onPress={() => setEditUserName(true)}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee', color: '#888' }]}
        value={email}
        editable={false}
      />

      {/* Save Button */}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  editText: {
    fontSize: 20,
    color: '#1976d2',
    marginLeft: 8,
    marginRight: 4,
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