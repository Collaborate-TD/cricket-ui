import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { getMyCoaches, getCoachProfile } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function MyCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState({ visible: false, coach: null });
  const router = useRouter();

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const token = await getToken();
        const user = jwtDecode(token);
        const studentId = user.id || user.userId || user._id;
        const res = await getMyCoaches(studentId);
        setCoaches(res.data);
      } catch (err) {
        alert('Failed to fetch coaches');
      } finally {
        setLoading(false);
      }
    };
    fetchCoaches();
  }, []);

  const handleViewProfile = async (coachId) => {
    try {
      const res = await getCoachProfile(coachId);
      setProfileModal({ visible: true, coach: res.data });
    } catch {
      alert('Failed to fetch coach profile');
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
      <Text style={styles.title}>My Coaches</Text>
      <FlatList
        data={coaches}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.coachItem}>
            <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => handleViewProfile(item._id)}
            >
              <Text style={styles.profileBtnText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No coaches found.</Text>}
      />

      {/* Profile Modal */}
      <Modal
        visible={profileModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModal({ visible: false, coach: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {profileModal.coach && (
              <>
                <Text style={styles.modalTitle}>Coach Profile</Text>
                <Text>Name: {profileModal.coach.firstName} {profileModal.coach.lastName}</Text>
                <Text>Email: {profileModal.coach.email}</Text>
                <Text>User ID: {profileModal.coach._id}</Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.profileBtn, { marginTop: 16 }]}
              onPress={() => setProfileModal({ visible: false, coach: null })}
            >
              <Text style={styles.profileBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/student'); // or your fallback route
          }
        }}
      >
        <Text style={{ fontSize: 32, color: '#1976d2' }}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  coachName: { fontSize: 18 },
  profileBtn: { backgroundColor: '#1976d2', padding: 8, borderRadius: 6 },
  profileBtnText: { color: '#fff' },
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