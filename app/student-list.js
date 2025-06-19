import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  getMatchUsers,
  getUnmatchUsers,
  requestCoach,
  getStudentProfile,
  handleUserRequest,
} from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';

const { width } = Dimensions.get('window');

export default function StudentList() {
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [unmatchedStudents, setUnmatchedStudents] = useState([]);
  const [coachId, setCoachId] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState({ visible: false, student: null });
  const router = useRouter();

  const refreshStudentLists = async (cid) => {
    setLoading(true);
    try {
      const [matchedRes, unmatchedRes] = await Promise.all([
        getMatchUsers(cid),
        getUnmatchUsers(cid),
      ]);
      setMatchedStudents(Array.isArray(matchedRes.data) ? matchedRes.data : []);
      setUnmatchedStudents(Array.isArray(unmatchedRes.data) ? unmatchedRes.data : []);
    } catch {
      Alert.alert('Error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (token) {
        const user = jwtDecode(token);
        const cid = user.id || user.userId || user._id;
        setCoachId(cid);
        await refreshStudentLists(cid);
      }
    };
    fetchData();
  }, []);

  const handleViewProfile = async (studentId) => {
    try {
      const res = await getStudentProfile(studentId);
      setProfileModal({ visible: true, student: res.data });
    } catch {
      Alert.alert('Error', 'Failed to fetch student profile');
    }
  };

  const handleRequest = async (studentId) => {
    try {
      await requestCoach({ requesterId: coachId, targetId: studentId });
      Alert.alert('Request Sent', 'Your request has been sent to the student.');
      await refreshStudentLists(coachId);
    } catch {
      Alert.alert('Error', 'Could not send request.');
    }
  };

  const handleAcceptRequest = async (studentId) => {
    try {
      await handleUserRequest({ approverId: coachId, requesterId: studentId, action: 'approved', feedback: '' });
      Alert.alert('Request Accepted', 'You have accepted the student request.');
      await refreshStudentLists(coachId);
    } catch {
      Alert.alert('Error', 'Could not accept request.');
    }
  };

  const handleRejectRequest = async (studentId) => {
    try {
      await handleUserRequest({ approverId: coachId, requesterId: studentId, action: 'rejected', feedback: '' });
      Alert.alert('Request Rejected', 'You have rejected the student request.');
      await refreshStudentLists(coachId);
    } catch {
      Alert.alert('Error', 'Could not reject request.');
    }
  };

  const handleBackPress = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/coach');
    }
  };

  const StudentCard = ({ student, children }) => (
    <View style={styles.studentCard}>
      <View>
        <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
        <Text style={styles.studentEmail}>{student.email || ''}</Text>
        <Text style={styles.studentId}>ID: {student.userId || student._id}</Text>
      </View>
      <View style={styles.buttonsRow}>{children}</View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.background}>
        <CustomHeader 
          title="My Students" 
          onBackPress={handleBackPress}
          defaultRoute="/coach"
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <CustomHeader 
        title="My Students" 
        onBackPress={handleBackPress}
        defaultRoute="/coach"
      />

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Approved Students</Text>
            {matchedStudents.length === 0 && <Text style={styles.emptyText}>No approved students yet.</Text>}
          </>
        }
        data={matchedStudents}
        keyExtractor={(item) => item.userId || item._id}
        renderItem={({ item }) => (
          <StudentCard student={item}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewProfile(item.userId)}>
              <Text style={styles.actionBtnText}>View</Text>
            </TouchableOpacity>
          </StudentCard>
        )}
        ListFooterComponent={
          <>
            <Text style={styles.titleMore}>Add More Students</Text>
            {unmatchedStudents.length === 0 && <Text style={styles.emptyText}>No more students to add.</Text>}
            <FlatList
              data={unmatchedStudents}
              keyExtractor={(item) => item.userId || item._id}
              renderItem={({ item }) => (
                <StudentCard student={item}>
                  {item.status === 'requested' && item.requestType === 'sent' ? (
                    <Text style={styles.pendingText}>Pending</Text>
                  ) : item.status === 'requested' && item.requestType === 'received' ? (
                    <>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(item.userId)}>
                        <Text style={styles.btnText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectRequest(item.userId)}>
                        <Text style={styles.btnText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  ) : item.status === 'rejected' ? (
                    <Text style={styles.rejectedText}>Rejected</Text>
                  ) : (
                    <TouchableOpacity style={styles.addBtn} onPress={() => handleRequest(item.userId)}>
                      <Text style={styles.btnText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </StudentCard>
              )}
              ListEmptyComponent={null}
              scrollEnabled={false}
            />
          </>
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={profileModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModal({ visible: false, student: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {profileModal.student ? (
              <>
                <Text style={styles.modalTitle}>Student Profile</Text>
                <Text style={styles.modalLabel}>Name:</Text>
                <Text style={styles.modalValue}>
                  {profileModal.student.firstName} {profileModal.student.lastName}
                </Text>
                <Text style={styles.modalLabel}>Email:</Text>
                <Text style={styles.modalValue}>{profileModal.student.email}</Text>
                <Text style={styles.modalLabel}>User ID:</Text>
                <Text style={styles.modalValue}>
                  {profileModal.student.userId || profileModal.student._id}
                </Text>
              </>
            ) : (
              <Text style={styles.modalValue}>Loading...</Text>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setProfileModal({ visible: false, student: null })}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
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
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 18,
    letterSpacing: 0.2,
    color: '#1976d2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleMore: {
    fontSize: 24,
    marginTop: 38,
    marginBottom: 18,
    letterSpacing: 0.2,
    color: '#1976d2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#fff',
    borderColor: '#e6e6e6',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222f3e',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  studentEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    opacity: 0.85,
    marginBottom: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#b0b0b0',
    marginBottom: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    marginLeft: 4,
    backgroundColor: 'transparent',
    borderColor: '#1976d2',
  },
  actionBtnText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    marginLeft: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  pendingText: {
    fontSize: 16,
    fontStyle: 'italic',
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#888',
  },
  acceptBtn: {
    backgroundColor: '#28a745',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    marginRight: 8,
  },
  rejectBtn: {
    backgroundColor: '#d9534f',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  rejectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#d9534f',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    opacity: 0.8,
    color: '#7f8c8d',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 18,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    color: '#1976d2',
    fontWeight: '600',
    marginTop: 8,
  },
  modalValue: {
    fontSize: 16,
    color: '#222f3e',
    marginBottom: 2,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 22,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});