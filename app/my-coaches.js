import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { getMyCoaches, getCoachProfile } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

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
    <View style={styles.background}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/student');
          }
        }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Coaches</Text>
      <FlatList
        data={coaches}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.coachCard}>
            <View>
              <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.coachEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => handleViewProfile(item._id)}
            >
              <Text style={styles.profileBtnText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No coaches found.</Text>
        }
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
                <Text style={styles.modalLabel}>Name:</Text>
                <Text style={styles.modalValue}>
                  {profileModal.coach.firstName} {profileModal.coach.lastName}
                </Text>
                <Text style={styles.modalLabel}>Email:</Text>
                <Text style={styles.modalValue}>{profileModal.coach.email}</Text>
                <Text style={styles.modalLabel}>User ID:</Text>
                <Text style={styles.modalValue}>{profileModal.coach._id}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setProfileModal({ visible: false, coach: null })}
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
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  coachName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222f3e',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  coachEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    opacity: 0.85,
    marginBottom: 2,
  },
  profileBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  profileBtnText: {
    color: '#fff',
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