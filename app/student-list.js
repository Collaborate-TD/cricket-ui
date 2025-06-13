import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import { getMatchUsers, getUnmatchUsers, requestCoach, getStudentProfile, handleUserRequest } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function StudentList() {
    const [matchedStudents, setMatchedStudents] = useState([]);
    const [unmatchedStudents, setUnmatchedStudents] = useState([]);
    const [coachId, setCoachId] = useState('');
    const [loading, setLoading] = useState(true);
    const [profileModal, setProfileModal] = useState({ visible: false, student: null });
    const router = useRouter();

    // Reusable function to refresh both lists
    const refreshStudentLists = async (cid) => {
        setLoading(true);
        try {
            const [matchedRes, unmatchedRes] = await Promise.all([
                getMatchUsers(cid),
                getUnmatchUsers(cid)
            ]);
            setMatchedStudents(Array.isArray(matchedRes.data) ? matchedRes.data : []);
            setUnmatchedStudents(Array.isArray(unmatchedRes.data) ? unmatchedRes.data : []);
        } catch (err) {
            alert('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = await getToken();
            const user = jwtDecode(token);
            const cid = user.id || user.userId || user._id;
            setCoachId(cid);
            await refreshStudentLists(cid);
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
            Alert.alert('Request Sent', 'Your request has been sent to the student.');
            await refreshStudentLists(coachId);
        } catch (err) {
            Alert.alert('Error', 'Could not send request.');
        }
    };

    // Accept student request
    const handleAcceptRequest = async (studentId) => {
        try {
            await handleUserRequest({
                approverId: coachId,
                requesterId: studentId,
                action: 'approved',
                feedback: ''
            });
            Alert.alert('Request Accepted', 'You have accepted the student request.');
            await refreshStudentLists(coachId);
        } catch (err) {
            Alert.alert('Error', 'Could not accept request.');
        }
    };

    // Reject student request
    const handleRejectRequest = async (studentId) => {
        try {
            await handleUserRequest({
                approverId: coachId,
                requesterId: studentId,
                action: 'rejected',
                feedback: ''
            });
            Alert.alert('Request Rejected', 'You have rejected the student request.');
            await refreshStudentLists(coachId);
        } catch (err) {
            Alert.alert('Error', 'Could not reject request.');
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
                data={matchedStudents}
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
                data={unmatchedStudents}
                keyExtractor={item => item.userId}
                renderItem={({ item }) => (
                    <View style={styles.studentItem}>
                        <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
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
                                <Text style={styles.profileTitle}>Student Profile</Text>
                                <View style={styles.profileRow}>
                                    <Text style={styles.profileLabel}>Name:</Text>
                                    <Text style={styles.profileValue}>{profileModal.student.firstName} {profileModal.student.lastName}</Text>
                                </View>
                                <View style={styles.profileRow}>
                                    <Text style={styles.profileLabel}>Email:</Text>
                                    <Text style={styles.profileValue}>{profileModal.student.email}</Text>
                                </View>
                                <View style={styles.profileRow}>
                                    <Text style={styles.profileLabel}>Username:</Text>
                                    <Text style={styles.profileValue}>{profileModal.student.userName}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.feedbackBtn}
                                    onPress={() => router.push(`/all-videos?studentId=${profileModal.student._id}`)}
                                >
                                    <Text style={styles.feedbackBtnText}>View Videos</Text>
                                </TouchableOpacity>
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
    pending: { color: '#888', fontStyle: 'italic' },
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