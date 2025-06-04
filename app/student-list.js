import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { getStudents, requestCoach, getStudentRequests } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [coachId, setCoachId] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState({ visible: false, student: null });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const user = jwtDecode(token);
        const cid = user.id || user.userId || user._id;
        setCoachId(cid);
        const [studentsRes, requestsRes] = await Promise.all([
          getStudents(),
          getStudentRequests(cid)
        ]);
        setStudents(studentsRes.data);
        setMyRequests(requestsRes.data); // likely array of { userId, status, ... }
      } catch (err) {
        alert('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewProfile = async (studentId) => {
    try {
      const res = await getStudentProfile(studentId);
      setProfileModal({ visible: true, student: res.data });
    } catch {
      alert('Failed to fetch student profile');
    }
  };

  // Send request to student
  const handleRequest = async (studentId) => {
    try {
      await requestCoach({ requesterId: coachId, targetId: studentId });
      alert('Request Sent!');
      // Optionally refresh requests
      const requestsRes = await getStudentRequests(coachId);
      setMyRequests(requestsRes.data);
    } catch (err) {
      alert('Could not send request.');
    }
  };

  // Find relation status for this student
  const getRequestStatus = (studentId) => {
    const req = myRequests.find(r => r.userId === studentId);
    if (!req) return null;
    if (req.status === 'REQUESTED') return 'pending';
    if (req.status === 'APPROVED') return 'accepted';
    return null;
  };

  // Filter out students already approved or pending
  const availableStudents = students.filter(student => {
    const relation = myRequests.find(r => r.userId === student._id);
    return !relation || (relation.status !== 'approved' && relation.status !== 'requested');
  });

  const approvedStudents = students.filter(student => {
    const relation = myRequests.find(r => r.userId === student._id);
    return relation && relation.status === 'approved';
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/coach');
          }
        }}
      >
        <Text style={{ fontSize: 32, color: '#1976d2' }}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Students</Text>
      <FlatList
        data={approvedStudents}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => handleViewProfile(item._id)}
            >
              <Text style={styles.profileBtnText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No approved students yet.</Text>}
      />

      <Text style={styles.title}>Add More Students</Text>
      <FlatList
        data={availableStudents}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.studentItem}>
            <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
            <TouchableOpacity onPress={() => handleRequest(item._id)}>
              <Text style={styles.addBtn}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No more students to add.</Text>}
      />

      {/* Profile Modal */}
      <Modal
        visible={profileModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModal({ visible: false, student: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {profileModal.student && (
              <>
                <Text style={styles.modalTitle}>Student Profile</Text>
                <Text>Name: {profileModal.student.firstName} {profileModal.student.lastName}</Text>
                <Text>Email: {profileModal.student.email}</Text>
                <Text>User ID: {profileModal.student._id}</Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.profileBtn, { marginTop: 16 }]}
              onPress={() => setProfileModal({ visible: false, student: null })}
            >
              <Text style={styles.profileBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  studentName: { fontSize: 18 },
  profileBtn: { backgroundColor: '#1976d2', padding: 8, borderRadius: 6 },
  profileBtnText: { color: '#fff' },
  addBtn: { backgroundColor: '#1976d2', padding: 8, borderRadius: 6, color: '#fff' },
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
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
});