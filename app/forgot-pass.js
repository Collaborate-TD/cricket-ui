import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { forgotPassword } from '../services/api'; // You need to implement this API call
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const router = useRouter();

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async () => {
    setError('');
    setResetLink('');
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      if (res.data.resetLink) {
        setResetLink(res.data.resetLink);
        Alert.alert('Success', 'Reset link sent! Check your email.');
      } else {
        Alert.alert('Success', res.data.message || 'Reset link sent!');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>
      {resetLink ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: 'green' }}>Reset Link:</Text>
          <Text selectable style={{ color: 'blue' }}>{resetLink}</Text>
        </View>
      ) : null}
      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.link}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#1976d2', fontSize: 16 }
});