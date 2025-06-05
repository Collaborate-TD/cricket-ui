import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// import { getVideos } from '../services/api'; // implement this API

export default function AllVideos() {
  const [videos, setVideos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Replace 'userId' with the actual logged-in user's ID
    getVideos(userId)
      .then(res => setVideos(res.data))
      .catch(() => setVideos([]));
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/video-review/${item._id}`)}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Videos</Text>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={2}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 32}}>No videos yet.</Text>}
        ListFooterComponent={
          <TouchableOpacity style={styles.newRecording} onPress={() => router.push('/record-video')}>
            <Text style={styles.newRecordingIcon}>🎥</Text>
            <Text>New Recording</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { flex: 1, margin: 8, alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, padding: 8 },
  thumbnail: { width: 100, height: 100, borderRadius: 8 },
  title: { marginTop: 8, fontWeight: 'bold' },
  newRecording: { flex: 1, margin: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1976d2', borderRadius: 8, padding: 16 },
  newRecordingIcon: { fontSize: 40, marginBottom: 8 }
});