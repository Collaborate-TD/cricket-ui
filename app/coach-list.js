import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getMatchUsers, requestCoach, getUnmatchUsers, handleUserRequest } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function CoachList() {
    const [coaches, setCoaches] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [studentId, setStudentId] = useState('');
    const router = useRouter();

    // Reusable function to refresh both lists
    const refreshCoachLists = async (sid) => {
        try {
            const [coachRes, requestsRes] = await Promise.all([
                getMatchUsers(sid),
                getUnmatchUsers(sid)
            ]);
            setCoaches(Array.isArray(coachRes.data) ? coachRes.data : []);
            setMyRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch coaches.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = await getToken();
            const user = jwtDecode(token);
            const sid = user.id || user._id;
            setStudentId(sid);
            await refreshCoachLists(sid);
        };
        fetchData();
    }, []);

    // Send request to coach
    const handleRequest = async (coachId) => {
        try {
            await requestCoach({ requesterId: studentId, targetId: coachId });
            Alert.alert('Request Sent', 'Your request has been sent to the coach.');
            await refreshCoachLists(studentId);
        } catch (err) {
            Alert.alert('Error', 'Could not send request.');
        }
    };

    const handleAcceptRequest = async (coachId) => {
        try {
            await handleUserRequest({
                approverId: studentId,
                requesterId: coachId,
                action: 'approved',
                feedback: 'Request accepted.'
            });
            Alert.alert('Request Accepted', 'You have accepted the coach request.');
            await refreshCoachLists(studentId);
        } catch (err) {
            Alert.alert('Error', 'Could not accept request.');
        }
    };

    const handleRejectRequest = async (coachId) => {
        try {
            await handleUserRequest({
                approverId: studentId,
                requesterId: coachId,
                action: 'rejected',
                feedback: 'Your request has been rejected.'
            });
            Alert.alert('Request Rejected', 'You have rejected the coach request.');
            await refreshCoachLists(studentId);
        } catch (err) {
            Alert.alert('Error', 'Could not reject request.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={{ position: 'absolute', top: 40, left: 20, zIndex: 1 }}
                onPress={() => {
                    if (router.canGoBack?.()) {
                        router.back();
                    } else {
                        router.replace('/student');
                    }
                }}
            >
                <Text style={{ fontSize: 32, color: '#1976d2' }}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>My Coaches</Text>
            <FlatList
                data={coaches}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.coachItem}>
                        <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
                        <TouchableOpacity onPress={() => router.push(`/pi/${item._id}`)}>
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
                data={myRequests}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.coachItem}>
                        <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
                        {item.status === 'requested' && item.requestType === 'sent' ? (
                            <Text style={styles.pending}>Pending</Text>
                        ) : item.status === 'requested' && item.requestType === 'received' ? (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={() => handleAcceptRequest(item.userId)}>
                                    <Text style={styles.addBtn}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleRejectRequest(item.userId)}>
                                    <Text style={[styles.addBtn, { backgroundColor: 'red' }]}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        ) : item.status === 'rejected' ? (
                            <Text style={{ color: 'red' }}>Rejected</Text>
                        ) : (
                            <TouchableOpacity onPress={() => handleRequest(item.userId)}>
                                <Text style={styles.addBtn}>Add</Text>
                            </TouchableOpacity>
                        )}
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