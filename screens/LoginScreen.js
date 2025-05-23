import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password
            });
            Alert.alert('Success', `Logged in as ${res.data.role}`);
            // Store token or redirect here
        } catch (err) {
            Alert.alert('Login Failed', err.response?.data?.error || 'Server error');
        }
    };

    return (
        <>
            <View style={styles.container}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
                <Button title="Login" onPress={handleLogin} />

            </View>
            <Button
                title="Don't have an account? Register"
                onPress={() => navigation.navigate('Register')}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 12,
        borderRadius: 5
    }
});
