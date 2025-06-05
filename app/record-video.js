import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { uploadVideo } from '../services/api'; // You need to implement this API call

export default function RecordVideo() {
  const [hasPermission, setHasPermission] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setRecording(true);
    setLoading(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 5, quality: Camera.Constants.VideoQuality['480p'] });
      setRecording(false);
      setLoading(false);

      // Upload video to backend
      const formData = new FormData();
      formData.append('video', {
        uri: video.uri,
        name: 'recording.mp4',
        type: 'video/mp4'
      });
      // Optionally add userId or metadata
      // formData.append('userId', userId);

      await uploadVideo(formData);

      Alert.alert('Success', 'Video recorded and uploaded!', [
        { text: 'OK', onPress: () => router.replace('/all-videos') }
      ]);
    } catch (err) {
      setRecording(false);
      setLoading(false);
      Alert.alert('Error', 'Failed to record or upload video.');
    }
  };

  const stopRecording = async () => {
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

  return (
    <View style={{ flex: 1 }}>
      <Camera ref={cameraRef} style={{ flex: 1 }} type={Camera.Constants.Type.back} />
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
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center'
  },
  recordBtn: {
    backgroundColor: '#1976d2', padding: 20, borderRadius: 50
  },
  recordText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  stopBtn: {
    backgroundColor: 'red', padding: 20, borderRadius: 50
  },
  stopText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});