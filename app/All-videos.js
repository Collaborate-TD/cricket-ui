import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

export default function AllVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student'); // default to student
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const getRole = async () => {
      const token = await getToken();
      const user = jwtDecode(token);
      setRole(user.role || 'student');
    };
    getRole();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let filter = {};
        const token = await getToken();
        const user = jwtDecode(token);

        if (params.studentId) {
          filter.studentId = params.studentId;
        } else if (params.coachId) {
          filter.coachId = params.coachId;
        } else {
          filter.userId = user.id || user._id;
        }
        console.log('Filter:', filter);
        const res = await getVideos(filter);
        console.log('Fetched Videos:', res.data);
        setVideos(res.data.list);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [params.studentId, params.coachId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/video-review/${item._id}`)}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ marginBottom: 16 }}
        onPress={() => {
          // Change route based on role
          if (role === 'coach') {
            router.replace('/coach');
          } else {
            router.replace('/student');
          }
        }}
      >
        <Text style={{ fontSize: 18, color: '#1976d2' }}>← Back to Profile</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Videos</Text>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={2}
        ListEmptyComponent={
          loading
            ? <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading...</Text>
            : <Text style={{ textAlign: 'center', marginTop: 32 }}>No videos yet.</Text>
        }
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