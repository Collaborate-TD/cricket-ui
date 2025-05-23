import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // default to student

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:5000/api/users/register', {
                email,
                password,
                role
            });

            Alert.alert('Success', 'User registered successfully!');
            navigation.navigate('Login'); // go to login screen
        } catch (err) {
            Alert.alert(
                'Registration Failed',
                err.response?.data?.error || 'Something went wrong'
            );
        }
    };

    return (
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
            <TextInput
                placeholder="Role (student or coach)"
                value={role}
                onChangeText={setRole}
                style={styles.input}
            />
            <Button title="Register" onPress={handleRegister} />
        </View>
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
