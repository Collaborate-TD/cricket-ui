import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
// Import your logo image
import Logo from '../assets/logo.png'; // Adjust the path as needed

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo at the top */}
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Become Better Academy</Text>
        <Link href="/login" asChild>
          <Button title="Go to Login" color="#1976d2" />
        </Link>
        <View style={styles.spacer} />
        <Link href="/register" asChild>
          <Button title="Go to Register" color="#2193b0" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6dd5ed', // fallback
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  spacer: {
    height: 16,
  },
});