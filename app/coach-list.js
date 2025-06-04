import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getCoaches, requestCoach, getCoachRequests } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function CoachList() {
  const [coaches, setCoaches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [studentId, setStudentId] = useState('');
   const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      const user = jwtDecode(token);
      const sid = user.id || user._id;
      setStudentId(sid);

      const [coachRes, requestsRes] = await Promise.all([
        getCoaches(),
        getCoachRequests(sid)
      ]);
      setCoaches(coachRes.data);
      setMyRequests(requestsRes.data); // This is likely an array of { userId, status, ... }
    };
    fetchData();
  }, []);

  // Send request to coach
  const handleRequest = async (coachId) => {
    try {
      await requestCoach({ requesterId: studentId, targetId: coachId });
      Alert.alert('Request Sent', 'Your request has been sent to the coach.');
      // Optionally refresh requests
      const requestsRes = await getCoachRequests(studentId);
      setMyRequests(requestsRes.data);
    } catch (err) {
      Alert.alert('Error', 'Could not send request.');
    }
  };

  // Find relation status for this coach
  const getRequestStatus = (coachId) => {
    const req = myRequests.find(r => r.userId === coachId);
    if (!req) return null;
    if (req.status === 'REQUESTED') return 'pending';
    if (req.status === 'APPROVED') return 'accepted';
    return null;
  };

  // Filter out coaches already approved or pending
  const availableCoaches = coaches.filter(coach => {
    const relation = myRequests.find(r => r.userId === coach._id);
    return !relation || (relation.status !== 'approved' && relation.status !== 'requested');
  });

  const approvedCoaches = coaches.filter(coach => {
    const relation = myRequests.find(r => r.userId === coach._id);
    return relation && relation.status === 'approved';
  });

  return (
    <View style={styles.container}>
       {/* Back Button */}
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
      <Text style={styles.title}>My Coaches</Text>
      <FlatList
        data={approvedCoaches}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.coachItem}>
            <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
            <TouchableOpacity onPress={() => router.push(`/pi/${item._id}`)}>  {/*<<-- student ni profile thi coach profile ma kevi rite javay*/}
              <Text style={styles.viewBtn}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/chat/${item._id}`)}>
              <Text style={styles.messageBtn}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No approved coaches yet.</Text>}
      />

      <Text style={styles.title}>Add More Coaches</Text>
      <FlatList
        data={availableCoaches}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.coachItem}>
            <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
            <TouchableOpacity onPress={() => handleRequest(item._id)}>
              <Text style={styles.addBtn}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No more coaches to add.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  coachItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coachName: { fontSize: 18 },
  requestBtn: { backgroundColor: '#1976d2', padding: 8, borderRadius: 6 },
  requestBtnText: { color: '#fff' },
  profileBtn: { backgroundColor: '#eee', padding: 8, borderRadius: 6 },
  profileBtnText: { color: '#1976d2' },
  pending: { color: '#888', fontStyle: 'italic' },
  viewBtn: { color: '#1976d2' },
  messageBtn: { color: '#1976d2' },
  addBtn: { backgroundColor: '#1976d2', padding: 8, borderRadius: 6, color: '#fff' },
});