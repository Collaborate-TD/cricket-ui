import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>Welcome to the Cricket App</Text>
            <Link href="/login" asChild>
                <Button title="Go to Login" />
            </Link>
            <Link href="/register" asChild>
                <Button title="Go to Register" />
            </Link>
        </View>
    );
}