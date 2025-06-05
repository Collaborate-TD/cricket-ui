import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getVideos, uploadAnnotationFeedback } from '../services/api';
// You need to install react-native-sketch-canvas and link it for annotation
import SketchCanvas from '@terrylinla/react-native-sketch-canvas';

const { width } = Dimensions.get('window');

export default function VideoReview() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState(null);
  const [tab, setTab] = useState('student'); // 'student' or 'drills'
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Fetch video details by id
    getVideos(/* pass userId or fetch by id if you have endpoint */)
      .then(res => {
        // Find the video by id
        const found = res.data.find(v => v._id === id);
        setVideo(found);
      })
      .catch(() => setVideo(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendFeedback = async () => {
    setSaving(true);
    try {
      // Save the annotation as an image
      canvasRef.current.save('png', false, 'annotations', `${id}_annotation`, true, false, false);
      // The callback below will be triggered after saving
    } catch (err) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save annotation.');
    }
  };

  // This callback is triggered after the annotation is saved
  const onSketchSaved = async (success, filePath) => {
    if (!success) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save annotation image.');
      return;
    }
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('videoId', id);
      formData.append('feedback', feedback);
      formData.append('annotation', {
        uri: `file://${filePath}`,
        name: `${id}_annotation.png`,
        type: 'image/png'
      });

      await uploadAnnotationFeedback(formData);

      Alert.alert('Success', 'Feedback and annotation sent!');
      setFeedback('');
      // Optionally, clear the canvas or navigate back
    } catch (err) {
      Alert.alert('Error', 'Failed to upload feedback.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!video) return <View style={styles.center}><Text>Video not found.</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'student' && styles.tabActive]} onPress={() => setTab('student')}>
          <Text style={tab === 'student' ? styles.tabTextActive : styles.tabText}>Student Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'drills' && styles.tabActive]} onPress={() => setTab('drills')}>
          <Text style={tab === 'drills' ? styles.tabTextActive : styles.tabText}>Sample Drills</Text>
        </TouchableOpacity>
      </View>

      {tab === 'student' ? (
        <View style={{ flex: 1 }}>
          {/* Video Player */}
          <Video
            ref={videoRef}
            source={{ uri: video.url }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
          {/* Annotation Canvas */}
          <SketchCanvas
            ref={canvasRef}
            style={styles.canvas}
            strokeColor={'red'}
            strokeWidth={4}
            localSourceImage={null}
            onSketchSaved={onSketchSaved}
          />
          {/* Feedback Input */}
          <Text style={styles.label}>Feedback</Text>
          <TextInput
            style={styles.input}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Write feedback for the student..."
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendFeedback} disabled={saving}>
            <Text style={styles.sendBtnText}>{saving ? 'Sending...' : 'Send Feedback'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          {/* Sample Drills Section */}
          <Text style={styles.label}>Sample Drill Videos/Links</Text>
          {/* List of sample drills (replace with your actual data) */}
          {(video.sampleDrills || []).map((drill, idx) => (
            <TouchableOpacity key={idx} onPress={() => router.push(`/drill/${drill._id}`)}>
              <Text style={styles.drillLink}>{drill.title || drill.url}</Text>
            </TouchableOpacity>
          ))}
          {/* Add new drill (upload/select/paste URL) */}
          <TouchableOpacity style={styles.addDrillBtn}>
            <Text style={styles.addDrillText}>+ Add Drill</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: '#1976d2' },
  tabText: { color: '#888', fontWeight: 'bold' },
  tabTextActive: { color: '#1976d2', fontWeight: 'bold' },
  video: { width: width, height: width * 0.6, backgroundColor: '#000' },
  canvas: { position: 'absolute', top: 0, left: 0, width: width, height: width * 0.6, zIndex: 10 },
  label: { marginTop: 16, fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8, minHeight: 60 },
  sendBtn: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  drillLink: { color: '#1976d2', marginVertical: 8, textDecorationLine: 'underline' },
  addDrillBtn: { marginTop: 16, alignItems: 'center' },
  addDrillText: { color: '#1976d2', fontWeight: 'bold', fontSize: 16 }
});