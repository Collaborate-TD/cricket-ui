import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getCoaches, requestCoach, getMyCoachRequests } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

export default function CoachList() {
  const [coaches, setCoaches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      const user = jwtDecode(token);
      setStudentId(user.id || user._id);

      const [coachRes, requestsRes] = await Promise.all([
        getCoaches(),
        getMyCoachRequests(user.id || user._id)
      ]);
      setCoaches(coachRes.data);
      setMyRequests(requestsRes.data); // [{coachId, status}]
    };
    fetchData();
  }, []);

  const handleRequest = async (coachId) => {
    try {
      await requestCoach({ studentId, coachId });
      Alert.alert('Request Sent', 'Your request has been sent to the coach.');
      // Optionally refresh requests
    } catch (err) {
      Alert.alert('Error', 'Could not send request.');
    }
  };

  const getRequestStatus = (coachId) => {
    const req = myRequests.find(r => r.coachId === coachId);
    return req ? req.status : null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coaches</Text>
      <FlatList
        data={coaches}
        keyExtractor={item => item._id}
        renderItem={({ item }) => {
          const status = getRequestStatus(item._id);
          return (
            <View style={styles.coachItem}>
              <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
              {status === 'pending' && <Text style={styles.pending}>Pending</Text>}
              {status === 'accepted' && (
                <TouchableOpacity style={styles.profileBtn}>
                  <Text style={styles.profileBtnText}>View Profile</Text>
                </TouchableOpacity>
              )}
              {!status && (
                <TouchableOpacity style={styles.requestBtn} onPress={() => handleRequest(item._id)}>
                  <Text style={styles.requestBtnText}>Request</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text>No coaches found.</Text>}
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
});