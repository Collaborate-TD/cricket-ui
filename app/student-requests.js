import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { getStudentRequests, acceptStudentRequest, declineStudentRequest } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState('');
  const [declineModal, setDeclineModal] = useState({ visible: false, requestId: null });
  const [feedback, setFeedback] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = await getToken();
        const user = jwtDecode(token);
        const id = user.id || user.userId || user._id;
        setCoachId(id);

        const res = await getStudentRequests(id);
        setRequests(res.data);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch student requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await acceptStudentRequest(requestId);
      setRequests(requests.filter(r => r._id !== requestId));
      Alert.alert('Accepted', 'Student request accepted.');
    } catch (err) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDecline = async () => {
    try {
      await declineStudentRequest(declineModal.requestId, feedback);
      setRequests(requests.filter(r => r._id !== declineModal.requestId));
      setDeclineModal({ visible: false, requestId: null });
      setFeedback('');
      Alert.alert('Declined', 'Student request declined.');
    } catch (err) {
      Alert.alert('Error', 'Failed to decline request');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/coach'); // or your fallback route
          }
        }}
      >
        <Text style={{ fontSize: 32, color: '#1976d2' }}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Student Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.studentInfo}>Email: {item.studentEmail}</Text>
              <Text style={styles.studentInfo}>User ID: {item.studentId}</Text>
            </View>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item._id)}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => setDeclineModal({ visible: true, requestId: item._id })}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No pending requests.</Text>}
      />

      {/* Decline Modal */}
      <Modal
        visible={declineModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeclineModal({ visible: false, requestId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 10 }}>Feedback for declining:</Text>
            <TextInput
              style={styles.input}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Enter feedback"
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.acceptBtn, { marginRight: 10 }]}
                onPress={handleDecline}
              >
                <Text style={styles.acceptBtnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => setDeclineModal({ visible: false, requestId: null })}
              >
                <Text style={styles.declineBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentName: { fontSize: 18, fontWeight: 'bold' },
  studentInfo: { fontSize: 14, color: '#555' },
  acceptBtn: { backgroundColor: '#1976d2', padding: 8, borderRadius: 6 },
  acceptBtnText: { color: '#fff' },
  declineBtn: { backgroundColor: '#eee', padding: 8, borderRadius: 6, marginLeft: 8 },
  declineBtnText: { color: '#d32f2f' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 60,
    textAlignVertical: 'top',
  },
});