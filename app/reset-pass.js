import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { resetPassword } from '../services/api';

function validatePassword(password) {
  // At least 6 chars, one number, one special char
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(password);
}

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState({ password: false, confirm: false });

  const handleReset = async () => {
    setError('');
    if (!password) {
      setError('Password is required');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters, include a number and a special character');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Reset token is missing.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password });
      Alert.alert('Success', 'Password updated successfully!');
      router.replace('/login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your new password below.
        </Text>
        <TextInput
          style={[
            styles.input,
            inputFocused.password && styles.inputFocused
          ]}
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setInputFocused(f => ({ ...f, password: true }))}
          onBlur={() => setInputFocused(f => ({ ...f, password: false }))}
          placeholderTextColor="#b0b0b0"
        />
        <TextInput
          style={[
            styles.input,
            inputFocused.confirm && styles.inputFocused
          ]}
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          onFocus={() => setInputFocused(f => ({ ...f, confirm: true }))}
          onBlur={() => setInputFocused(f => ({ ...f, confirm: false }))}
          placeholderTextColor="#b0b0b0"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Back to Login</Text>
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
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 22,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fafbfc',
    fontSize: 16,
    color: '#222',
  },
  inputFocused: {
    borderColor: '#1976d2',
    backgroundColor: '#f4f8fb',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  linkBtn: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  linkText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '500',
  },
});
