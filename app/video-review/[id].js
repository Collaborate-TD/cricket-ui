import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../../services/api';

export default function VideoReview() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add this line
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await getVideos();
        const found = res.data.list.find(v => v._id === id);
        setVideo(found);
      } catch (err) {
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  // Automatically present fullscreen when video is loaded
  const handleVideoReady = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.presentFullscreenPlayer();
      } catch (e) {
        // Ignore if not supported on web
      }
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!video) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 40 }}>Video not found.</Text>;

  return (
    <View style={styles.container} key={refreshKey}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/all-videos')}>
        <Text style={styles.backText}>← Back to All Videos</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{video.title || video._id}</Text>
      <Video
        ref={videoRef}
        source={{ uri: video.url }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        onReadyForDisplay={handleVideoReady}
        onFullscreenUpdate={event => {
          // 3 means fullscreen exited
          if (event.fullscreenUpdate === 3) {
            setRefreshKey(k => k + 1); // Force re-render to fix layout
          }
        }}
      />
      <Text style={styles.videoId}>Video ID: {video._id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 18, color: '#1976d2' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  videoId: { marginTop: 16, textAlign: 'center', color: '#666' }
});