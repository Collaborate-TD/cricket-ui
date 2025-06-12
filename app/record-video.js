import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
// import { uploadVideo } from '../services/api'; // Uncomment this in your real app

// Web implementation
const RecordVideoWeb = () => {
  const router = useRouter();
  const webcamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [WebcamComponent, setWebcamComponent] = useState(null);

  useEffect(() => {
    const loadWebcam = async () => {
      try {
        const mod = await import('react-webcam');
        setWebcamComponent(() => mod.default);
      } catch (err) {
        console.error('Failed to load react-webcam:', err);
      }
    };
    loadWebcam();
  }, []);

  const startRecordingWeb = async () => {
    if (!webcamRef.current) return;
    setRecording(true);
    setLoading(true);

    try {
      const stream = webcamRef.current.stream;
      const mediaRecorder = new window.MediaRecorder(stream);
      let chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], 'recording.webm', { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', file);

        // await uploadVideo(formData); // Enable in your project
        setRecording(false);
        setLoading(false);
        Alert.alert('Success', 'Video recorded and uploaded!', [
          { text: 'OK', onPress: () => router.replace('/all-videos') }
        ]);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    } catch (err) {
      console.error('Recording error:', err);
      setRecording(false);
      setLoading(false);
      Alert.alert('Error', 'Failed to record or upload video.');
    }
  };

  if (!WebcamComponent) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading webcam component...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 16, zIndex: 10 }}
        onPress={() => router.back()}
      >
        <Text style={{ fontSize: 18, color: '#1976d2' }}>← Back</Text>
      </TouchableOpacity>
      <WebcamComponent
        audio
        ref={webcamRef}
        style={{ width: 400, height: 300 }}
      />
      <TouchableOpacity
        style={styles.recordBtn}
        onPress={startRecordingWeb}
        disabled={loading || recording}
      >
        <Text style={styles.recordText}>{recording ? 'Recording...' : 'Record 5s'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// Mobile implementation
const RecordVideoMobile = () => {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const { Camera } = require('expo-camera');
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    const { Camera } = require('expo-camera');
    if (!cameraRef.current) return;
    setRecording(true);
    setLoading(true);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 5,
        quality: Camera.Constants.VideoQuality['480p']
      });

      const formData = new FormData();
      formData.append('video', {
        uri: video.uri,
        name: 'recording.mp4',
        type: 'video/mp4'
      });

      // await uploadVideo(formData); // Enable in your project

      setRecording(false);
      setLoading(false);
      Alert.alert('Success', 'Video recorded and uploaded!', [
        { text: 'OK', onPress: () => router.replace('/all-videos') }
      ]);
    } catch (err) {
      console.error('Recording error:', err);
      setRecording(false);
      setLoading(false);
      Alert.alert('Error', 'Failed to record or upload video.');
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
    }
  };

  if (hasPermission === null) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera</Text></View>;
  }

  const { Camera } = require('expo-camera');
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 16, zIndex: 10 }}
        onPress={() => router.back()}
      >
        <Text style={{ fontSize: 18, color: '#1976d2' }}>← Back</Text>
      </TouchableOpacity>
      <Camera ref={cameraRef} style={{ flex: 1 }} type={Camera.Type.back} />
      <View style={styles.controls}>
        {!recording ? (
          <TouchableOpacity style={styles.recordBtn} onPress={startRecording} disabled={loading}>
            <Text style={styles.recordText}>Record 5s</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Root Component
export default function RecordVideo() {
  return Platform.OS === 'web' ? <RecordVideoWeb /> : <RecordVideoMobile />;
}

// Shared styles
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  recordBtn: { backgroundColor: '#1976d2', padding: 20, borderRadius: 50 },
  stopBtn: { backgroundColor: 'red', padding: 20, borderRadius: 50 },
  recordText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  stopText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
