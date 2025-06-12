import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { getStudentRequests, acceptStudentRequest, declineStudentRequest } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

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

  // Accept student request
  const handleAccept = async (studentId) => {
    try {
      await acceptStudentRequest({ approverId: coachId, requesterId: studentId });
      setRequests(requests.filter(r => r.studentId !== studentId));
      Alert.alert('Accepted', 'Student request accepted.');
    } catch (err) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  // Decline student request
  const handleDecline = async () => {
    if (!declineModal.requestId) {
      Alert.alert('Error', 'Student ID is missing for this request.');
      return;
    }
    try {
      await declineStudentRequest({ approverId: coachId, requesterId: declineModal.requestId, feedback });
      setRequests(requests.filter(r => r.studentId !== declineModal.requestId));
      setFeedback('');
      setDeclineModal({ visible: false, requestId: null });
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

  const RequestCard = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.studentInfo}>Email: {item.studentEmail}</Text>
        <Text style={styles.studentInfo}>User ID: {item.studentId}</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.studentId)}>
        <Text style={styles.acceptBtnText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.declineBtn}
        onPress={() => setDeclineModal({ visible: true, requestId: item.studentId })}
      >
        <Text style={styles.declineBtnText}>Decline</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.background}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/coach');
          }
        }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Student Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <RequestCard item={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending requests.</Text>
        }
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
            <Text style={styles.modalTitle}>Decline Request</Text>
            <Text style={styles.modalLabel}>Feedback (optional):</Text>
            <TextInput
              style={styles.input}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Enter feedback"
              multiline
              placeholderTextColor="#b0b0b0"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleDecline}
              >
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setDeclineModal({ visible: false, requestId: null })}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    paddingTop: 0,
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 20,
    zIndex: 2,
    padding: 8,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    borderRadius: 8,
  },
  backArrow: {
    fontSize: 32,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 60,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 0,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222f3e',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  studentInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    opacity: 0.85,
    marginBottom: 2,
  },
  acceptBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 10,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  declineBtn: {
    backgroundColor: '#fff0f0',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 1,
  },
  declineBtnText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
    color: '#7f8c8d',
    opacity: 0.8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f8fb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 16,
    width: width > 400 ? 350 : '85%',
    elevation: 8,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    color: '#1976d2',
    fontWeight: '600',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    minHeight: 60,
    textAlignVertical: 'top',
    width: '100%',
    marginBottom: 10,
    color: '#222',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    width: '100%',
  },
  modalBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: '#1976d2',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  cancelBtn: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  cancelBtnText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});