import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { forgotPassword } from '../services/api';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLink, setResetLink] = useState('');
    const [message, setMessage] = useState('');
    const [inputFocused, setInputFocused] = useState(false);
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
                setMessage(res.data.message || 'Reset link sent to your email!');
                Alert.alert('Success', 'Reset link sent! Check your email.');
            } else {
                setMessage(res.data.message || 'Failed to send reset link.');
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
        <View style={styles.background}>
            <View style={styles.card}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you a reset link.
                </Text>
                <TextInput
                    style={inputFocused ? styles.inputFocused : styles.input}
                    placeholder="Enter your email"
                    value={email}
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholderTextColor="#b0b0b0"
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {resetLink ? (
                    <View style={styles.resetLinkContainer}>
                        <Text style={styles.successText}>{message}</Text>
                    </View>
                ) : null}
                <TouchableOpacity
                    style={loading ? styles.buttonLoading : styles.button}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.replace('/login')}
                    style={styles.linkBtn}
                >
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
        shadowColor: '#000',
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
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#1976d2',
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        backgroundColor: '#f4f8fb',
        fontSize: 16,
        color: '#222',
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
    buttonLoading: {
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
    successText: {
        color: 'green',
        fontSize: 15,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    resetLinkContainer: {
        marginBottom: 5,
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
