import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AllPictures() {
  const router = useRouter();
  const scheme = useColorScheme();
  const stylesSet = scheme === 'dark' ? darkStyles : lightStyles;

  const pictures = [
    { id: 1, uri: 'https://via.placeholder.com/300x200.png?text=Image+1' },
    { id: 2, uri: 'https://via.placeholder.com/300x200.png?text=Image+2' },
    { id: 3, uri: 'https://via.placeholder.com/300x200.png?text=Image+3' },
    { id: 4, uri: 'https://via.placeholder.com/300x200.png?text=Image+4' },
  ];

  return (
    <View style={stylesSet.container}>
      <TouchableOpacity style={stylesSet.backButton} onPress={() => router.back()}>
        <Text style={stylesSet.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={stylesSet.title}>All Pictures</Text>
      <ScrollView contentContainerStyle={stylesSet.scrollContent}>
        {pictures.map((pic) => (
          <Image
            key={pic.id}
            source={{ uri: pic.uri }}
            style={stylesSet.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#dce6f1',
  },
  backText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222f3e',
    alignSelf: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#ccc',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#2e3350',
  },
  backText: {
    fontSize: 16,
    color: '#8ab4f8',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#f5f6fa',
    alignSelf: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#333',
  },
});
