import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getVideos } from '../../services/api';
import VideoPlayerWithAnnotations from '../../components/VideoPlayerWithAnnotations';
import VideoPreviewSection from '../../components/VideoPreviewSection';
import { addAnnotation, getAnnotations } from '../../services/api';
import {
  loadAnnotationsLocally,
  saveAnnotationsLocally,
  removeAnnotationsLocally,
} from '../../utils/annotationStorage';
import { API_URL } from '@env';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../../utils/tokenStorage';

const VideoReviewScreen = ({ userId, token }) => {
  const { id: videoId } = useLocalSearchParams();
  const router = useRouter();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const [annotationMode, setAnnotationMode] = useState(false);

  // Load video and annotations on mount
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        let filter = {};
        const token = await getToken();
        const user = jwtDecode(token);
        filter.userId = user.id || user._id;
        const res = await getVideos(filter);
        const found = res.data.list.find(v => v._id === videoId);
        setVideo(found);

        const remote = await getAnnotations(videoId, token);
        setAnnotations(remote?.length ? remote[0].data : []);
      } catch (e) {
        setVideo(null);
        Alert.alert('Error', 'Failed to load video or annotations.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId, token]);

  // Save annotations locally on change
  useEffect(() => {
    if (!loading) {
      saveAnnotationsLocally(videoId, annotations);
    }
  }, [annotations, videoId, loading]);

  // Save and upload handler
  const handleSave = async () => {
    try {
      await saveAnnotationsLocally(videoId, annotations);
      await addAnnotation(videoId, {
        coachId: userId,
        data: annotations,
      }, token);
      await removeAnnotationsLocally(videoId);
      Alert.alert('Success', 'Annotations saved and uploaded!');
      setAnnotationMode(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to upload. Annotations are saved locally.');
    }
  };

  // Add this handler for exiting annotation mode without saving
  const handleExitAnnotation = () => {
    setAnnotationMode(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Video not found.</Text>
      </View>
    );
  }

  // Use video.url if it's a full URL, or construct from fileName if needed
  const videoUri = video.url && video.url.startsWith('http')
    ? video.url
    : `${API_URL}/uploads/${video.fileName}`;

  return (
    <View style={{ flex: 1 }}>
      {!annotationMode ? (
        <VideoPreviewSection
          videoId={videoId}
          onAnnotate={() => setAnnotationMode(true)}
          annotations={annotations}
          setAnnotations={setAnnotations}
        />
      ) : (
        <VideoPlayerWithAnnotations
          videoUri={videoUri}
          annotations={annotations}
          setAnnotations={setAnnotations}
          onSave={handleSave}
          onExit={handleExitAnnotation}
        />
      )}
    </View>
  );
};

export default VideoReviewScreen;