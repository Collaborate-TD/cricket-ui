import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)',
        backgroundColor: '#6dd5ed', // fallback for native
      }}
    >
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          padding: 32,
          alignItems: 'center',
          shadowColor: '#1976d2',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1976d2',
            marginBottom: 24,
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          Welcome to the Cricket App
        </Text>
        <Link href="/login" asChild>
          <Button title="Go to Login" color="#1976d2" />
        </Link>
        <View style={{ height: 16 }} />
        <Link href="/register" asChild>
          <Button title="Go to Register" color="#2193b0" />
        </Link>
      </View>
    </View>
  );
}