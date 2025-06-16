import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function AllVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student');
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const colors = scheme === 'dark'
    ? {
        background: '#181c24',
        textPrimary: '#f5f6fa',
        cardBackground: '#23243a',
        accent: '#8ab4f8',
        border: '#333',
      }
    : {
        background: '#f4f8fb',
        textPrimary: '#222f3e',
        cardBackground: '#fff',
        accent: '#1976d2',
        border: '#e0e0e0',
      };

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
        const token = await getToken();
        const user = jwtDecode(token);
        const filter = {
          ...(params.studentId && { studentId: params.studentId }),
          ...(params.coachId && { coachId: params.coachId }),
          userId: user.id || user._id,
        };
        const res = await getVideos(filter);
        setVideos(res.data.list || []);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [params.studentId, params.coachId]);

  const renderItem = (item) => (
    <TouchableOpacity
      key={item._id}
      style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => router.push(`/video-review/${item._id}`)}
      activeOpacity={0.9}
    >
      <Video
        source={{ uri: item.url }}
        style={styles.thumbnail}
        resizeMode="cover"
        isMuted
        shouldPlay={false}
        usePoster={!!item.thumbnailUrl}
        posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
      />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        onPress={() => router.replace(role === 'coach' ? '/coach' : '/student')}
        style={styles.backBtn}
      >
        <Text style={[styles.backText, { color: colors.accent }]}>← Back to Profile</Text>
      </TouchableOpacity>

      <Text style={[styles.header, { color: colors.textPrimary }]}>Your Videos</Text>

      <TouchableOpacity
        onPress={() =>
          router.push(
            params.studentId
              ? `/record-video?studentId=${params.studentId}`
              : '/record-video'
          )
        }
        activeOpacity={0.8}
        style={styles.newRecordingContainer}
      >
        <LinearGradient
          colors={['#8ab4f8', '#1976d2']}
          style={styles.newRecording}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.recordIcon}>🎥</Text>
          <Text style={styles.recordText}>New Recording</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.grid}>
        {videos.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No videos yet.</Text>
        ) : (
          videos.map(renderItem)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 12,
  },
  newRecordingContainer: {
    marginBottom: 20,
  },
  newRecording: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  recordIcon: {
    fontSize: 36,
    marginBottom: 8,
    color: '#fff',
  },
  recordText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#ccc',
  },
  title: {
    padding: 10,
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 40,
    fontFamily: 'Poppins_400Regular',
    width: '100%',
  },
});
