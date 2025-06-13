import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { getMatchUsers, requestCoach, getUnmatchUsers, handleUserRequest, getStudentProfile } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function CoachList() {
    const [coaches, setCoaches] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [profileModal, setProfileModal] = useState({ visible: false, coach: null });
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

    // Add this function in CoachList component
    const handleViewProfile = async (coachId) => {
        try {
            // You may need to create a getCoachProfile API similar to getStudentProfile
            const res = await getStudentProfile(coachId); // Or getCoachProfile if available
            setProfileModal({ visible: true, coach: res.data });
        } catch {
            Alert.alert('Error', 'Failed to fetch coach profile.');
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
                        {/* <TouchableOpacity onPress={() => router.push(`/all-videos?coachId=${item._id}`)}>
                            <Text style={styles.viewBtn}>View</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => router.push(`/chat/${item._id}`)}>
                            <Text style={styles.messageBtn}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleViewProfile(item._id)}>
                            <Text style={styles.profileBtnText}>View Profile</Text>
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
                                <Text style={styles.profileTitle}>Coach Profile</Text>
                                <View style={styles.profileRow}>
                                    <Text style={styles.profileLabel}>Name:</Text>
                                    <Text style={styles.profileValue}>{profileModal.coach.firstName} {profileModal.coach.lastName}</Text>
                                </View>
                                <View style={styles.profileRow}>
                                    <Text style={styles.profileLabel}>Email:</Text>
                                    <Text style={styles.profileValue}>{profileModal.coach.email}</Text>
                                </View>
                                <View style={styles.profileRow}>
                                    <Text style={styles.profileLabel}>Username:</Text>
                                    <Text style={styles.profileValue}>{profileModal.coach.userName}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.feedbackBtn}
                                    onPress={() => router.push(`/all-videos?coachId=${profileModal.coach._id}`)}
                                >
                                    <Text style={styles.feedbackBtnText}>View Feedbacks</Text>
                                </TouchableOpacity>
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
    profileTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 18,
        color: '#1976d2',
        alignSelf: 'center',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileLabel: {
        fontWeight: 'bold',
        color: '#444',
        width: 90,
        fontSize: 16,
    },
    profileValue: {
        color: '#222',
        fontSize: 16,
        flexShrink: 1,
    },
    feedbackBtn: {
        marginTop: 18,
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    feedbackBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
});