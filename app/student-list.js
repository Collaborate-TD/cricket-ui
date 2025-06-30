import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    useColorScheme,
    ScrollView,
    Modal,
    Dimensions,
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
    const scheme = useColorScheme();
    const router = useRouter();

    const truncate = (str, maxLength) =>
        str.length > maxLength ? str.slice(0, maxLength) + '...' : str;

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

    const handleRemoveStudent = async (student, studentName) => {
        Alert.alert(
            'Remove Student',
            `Are you sure you want to remove ${studentName} from your approved students?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const studentId = student._id || student.userId || student.id;
                            
                            await handleUserRequest({ 
                                approverId: coachId, 
                                requesterId: studentId, 
                                action: 'rejected', 
                                feedback: 'Removed by coach' 
                            });
                            
                            Alert.alert('Student Removed', `${studentName} has been removed from your approved students.`);
                            await refreshStudentLists(coachId);
                        } catch (error) {
                            console.error('Failed to remove student:', error);
                            Alert.alert(
                                'Error', 
                                `Could not remove student. ${error.response?.data?.message || error.message || 'Please try again.'}`
                            );
                        }
                    }
                }
            ]
        );
    };

    const handleBackPress = () => {
        if (router.canGoBack?.()) {
            router.back();
        } else {
            router.replace('/coach');
        }
    };

    // StudentCard component
    const StudentCard = ({ student, children }) => (
        <View style={scheme === 'dark' ? styles.studentCardDark : styles.studentCardLight}>
            <View>
                <Text style={scheme === 'dark' ? styles.studentNameDark : styles.studentNameLight}>
                    {truncate(`${student.firstName} ${student.lastName}`, 15)}
                </Text>
                <Text style={scheme === 'dark' ? styles.studentEmailDark : styles.studentEmailLight}>
                    {student.email || ''}
                </Text>
            </View>
            <View style={styles.buttonsRow}>{children}</View>
        </View>
    );

    if (loading) {
        return (
            <View style={scheme === 'dark' ? styles.backgroundDark : styles.backgroundLight}>
                <CustomHeader
                    title="My Students"
                    onBackPress={handleBackPress}
                    defaultRoute="/coach"
                />
                <View style={styles.centered}>
                    <Text style={scheme === 'dark' ? styles.loadingTextDark : styles.loadingTextLight}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={scheme === 'dark' ? styles.backgroundDark : styles.backgroundLight}>
            <CustomHeader
                title="My Students"
                onBackPress={handleBackPress}
                defaultRoute="/coach"
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={scheme === 'dark' ? styles.titleDark : styles.titleLight}>
                    Approved Students
                </Text>
                {matchedStudents.length === 0 ? (
                    <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyTextLight}>
                        No approved students yet.
                    </Text>
                ) : (
                    matchedStudents.map((student) => (
                        <StudentCard key={student.userId || student._id} student={student}>
                            <TouchableOpacity
                                onPress={() => handleViewProfile(student._id)}
                                style={scheme === 'dark' ? styles.viewBtnDark : styles.viewBtnLight}
                            >
                                <Text style={scheme === 'dark' ? styles.actionBtnTextDark : styles.actionBtnTextLight}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleRemoveStudent(student, `${student.firstName} ${student.lastName}`)}
                                style={scheme === 'dark' ? styles.removeBtnDark : styles.removeBtnLight}
                            >
                                <Text style={scheme === 'dark' ? styles.removeBtnTextDark : styles.removeBtnTextLight}>Remove</Text>
                            </TouchableOpacity>
                        </StudentCard>
                    ))
                )}

                <Text style={scheme === 'dark' ? styles.titleSecondaryDark : styles.titleSecondaryLight}>
                    Add More Students
                </Text>
                {unmatchedStudents.length === 0 ? (
                    <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyTextLight}>
                        No more students to add.
                    </Text>
                ) : (
                    unmatchedStudents.map((student) => (
                        <StudentCard key={student.userId || student._id} student={student}>
                            {student.status === 'requested' && student.requestType === 'sent' ? (
                                <Text style={scheme === 'dark' ? styles.pendingTextDark : styles.pendingTextLight}>Pending</Text>
                            ) : student.status === 'requested' && student.requestType === 'received' ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleAcceptRequest(student.userId)}
                                    >
                                        <Text
                                            style={scheme === 'dark' ? styles.acceptBtnDark : styles.acceptBtnLight}
                                        >
                                            ✔
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleRejectRequest(student.userId)}
                                    >
                                        <Text
                                            style={scheme === 'dark' ? styles.rejectBtnDark : styles.rejectBtnLight}
                                        >
                                            ✖
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : student.status === 'rejected' ? (
                                <Text style={scheme === 'dark' ? styles.rejectedTextDark : styles.rejectedTextLight}>Rejected</Text>
                            ) : (
                                <TouchableOpacity
                                    style={scheme === 'dark' ? styles.addBtnDark : styles.addBtnLight}
                                    onPress={() => handleRequest(student.userId)}
                                >
                                    <Text style={styles.btnText}>Add</Text>
                                </TouchableOpacity>
                            )}
                        </StudentCard>
                    ))
                )}
            </ScrollView>

            {/* Profile Modal */}
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
                        ) : (
                            <Text style={styles.profileValue}>Loading...</Text>
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
    // Background styles
    backgroundLight: {
        flex: 1,
        backgroundColor: '#f4f8fb',
    },
    backgroundDark: {
        flex: 1,
        backgroundColor: '#181c24',
    },

    // Centered loading styles
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingTextLight: {
        color: '#7f8c8d'
    },
    loadingTextDark: {
        color: '#aaaaaa'
    },

    // Scroll content
    scrollContent: {
        padding: 24,
        paddingBottom: 48,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },

    // Title styles
    titleLight: {
        fontSize: 24,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#1976d2',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleDark: {
        fontSize: 24,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#f5f6fa',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleSecondaryLight: {
        fontSize: 24,
        marginTop: 38,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#1976d2',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleSecondaryDark: {
        fontSize: 24,
        marginTop: 38,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#f5f6fa',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Student card styles
    studentCardLight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 14,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        backgroundColor: '#fff',
        shadowColor: 'rgba(25, 118, 210, 0.08)',
        borderColor: '#e6e6e6',
    },
    studentCardDark: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 14,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        backgroundColor: '#23243a',
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: '#2e3350',
    },

    // Student name styles
    studentNameLight: {
        fontSize: 20,
        marginBottom: 2,
        letterSpacing: 0.1,
        color: '#222f3e',
        fontWeight: '600',
    },
    studentNameDark: {
        fontSize: 20,
        marginBottom: 2,
        letterSpacing: 0.1,
        color: '#f5f6fa',
        fontWeight: '600',
    },

    // Student email styles
    studentEmailLight: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 2,
        color: '#7f8c8d',
    },
    studentEmailDark: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 2,
        color: '#aaaaaa',
    },

    // Buttons row
    buttonsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },

    // Action button styles
    viewBtnLight: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
        borderColor: '#1976d2',
    },
    viewBtnDark: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
        borderColor: '#3b5998',
    },

    // Remove button styles
    removeBtnLight: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
        borderColor: '#d9534f',
    },
    removeBtnDark: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
        borderColor: '#dc3545',
    },

    // Remove button text styles
    removeBtnTextLight: {
        fontSize: 16,
        color: '#d9534f',
        fontWeight: '600',
    },
    removeBtnTextDark: {
        fontSize: 16,
        color: '#dc3545',
        fontWeight: '600',
    },

    // Action button text styles
    actionBtnTextLight: {
        fontSize: 16,
        color: '#1976d2',
        fontWeight: '600',
    },
    actionBtnTextDark: {
        fontSize: 16,
        color: '#3b5998',
        fontWeight: '600',
    },

    // Pending text styles
    pendingTextLight: {
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#7f8c8d',
    },
    pendingTextDark: {
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#aaaaaa',
    },

    // Add button styles
    addBtnLight: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        marginLeft: 4,
        backgroundColor: '#1976d2',
    },
    addBtnDark: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        marginLeft: 4,
        backgroundColor: '#3b5998',
    },
    actionBtn: {
        paddingHorizontal: 8,
        paddingVertical: 9,
        borderRadius: 8,
    },
    // Accept button styles
    acceptBtnLight: {
        fontSize: 26,
        color: '#22C55E',
    },
    acceptBtnDark: {
        fontSize: 26,
        color: '#4CAF50',
    },

    // Reject button styles
    rejectBtnLight: {
        fontSize: 26,
        color: '#EF4444',
    },
    rejectBtnDark: {
        fontSize: 26,
        color: '#F44336',
    },

    // Button text
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.2,
    },

    // Rejected text styles
    rejectedTextLight: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#d9534f',
    },
    rejectedTextDark: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#d9534f',
    },

    // Empty text styles
    emptyTextLight: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
        opacity: 0.8,
        color: '#7f8c8d',
    },
    emptyTextDark: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
        opacity: 0.8,
        color: '#aaaaaa',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 10,
        width: width > 400 ? 350 : '85%',
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
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    profileBtn: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
    },
    profileBtnText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
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