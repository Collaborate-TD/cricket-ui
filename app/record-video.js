import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCameraPermissions, useMicrophonePermissions, CameraView } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

export default function RecordVideoScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    if (!microphonePermission) requestMicrophonePermission();
  }, [microphonePermission]);

  const uploadVideo = async (uri) => {
    try {
      const formData = new FormData();

      formData.append('videos', {
        uri,
        name: `video_${Date.now()}.mp4`,
        type: 'video/mp4',
      });

      // Get user info from JWT token
      const token = await getToken();
      const user = jwtDecode(token);

      let userId = params.studentId || user._id || user.id;
      formData.append('userId', userId);
      formData.append('username', user.username || user.email);

      if (params.studentId) formData.append('studentId', params.studentId);

      console.log('Upload URL:', `${process.env.API_URL}/file/upload`);

      const response = await fetch(`${process.env.API_URL}/file/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const resText = await response.text();
      console.log('Upload response:', resText);

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      Alert.alert('Success', 'Video uploaded successfully!');
      router.replace('/all-videos');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload video.');
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || recording || !isReady) return;

    setRecording(true);
    setLoading(true);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 5,
        quality: '480p',
      });

      console.log('Video URI:', video.uri);
      await uploadVideo(video.uri);
    } catch (err) {
      console.error('Recording error:', err);
      Alert.alert('Error', err.message || 'Recording failed');
    } finally {
      setRecording(false);
      setLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: 'blue' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        mode="video"
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.recordBtn}
          onPress={startRecording}
          disabled={!isReady || loading || recording}
        >
          <Text style={styles.recordText}>
            {loading || recording ? 'Recording...' : 'Record 5s'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordBtn: {
    backgroundColor: '#1976d2',
    padding: 20,
    borderRadius: 50,
  },
  recordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
