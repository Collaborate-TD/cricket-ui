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
} from 'react-native';
import { getMatchUsers, requestCoach, getUnmatchUsers, handleUserRequest, getStudentProfile } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { showAlert, showConfirm } from '../utils/alertMessage';

export default function CoachList() {
    const [coaches, setCoaches] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [profileModal, setProfileModal] = useState({ visible: false, coach: null });
    const scheme = useColorScheme();
    const router = useRouter();

    // Load fonts
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    // Reusable function to refresh both lists
    const refreshCoachLists = async (sid) => {
        try {
            const [coachRes, requestsRes] = await Promise.all([getMatchUsers(sid), getUnmatchUsers(sid)]);
            setCoaches(Array.isArray(coachRes.data) ? coachRes.data : []);
            setMyRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
        } catch (err) {
            showAlert('Error', 'Failed to fetch coaches.');
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
            showAlert('Request Sent', 'Your request has been sent to the coach.');
            await refreshCoachLists(studentId);
        } catch (err) {
            showAlert('Error', 'Could not send request.');
        }
    };

    const handleAcceptRequest = async (coachId) => {
        try {
            await handleUserRequest({
                approverId: studentId,
                requesterId: coachId,
                action: 'approved',
                feedback: 'Request accepted.',
            });
            showAlert('Request Accepted', 'You have accepted the coach request.');
            await refreshCoachLists(studentId);
        } catch (err) {
            showAlert('Error', 'Could not accept request.');
        }
    };

    const handleRejectRequest = async (coachId) => {
        try {
            await handleUserRequest({
                approverId: studentId,
                requesterId: coachId,
                action: 'rejected',
                feedback: 'Your request has been rejected.',
            });
            showAlert('Request Rejected', 'You have rejected the coach request.');
            await refreshCoachLists(studentId);
        } catch (err) {
            showAlert('Error', 'Could not reject request.');
        }
    };

    const handleRemoveCoach = async (coach, coachName) => {
        showConfirm(
            'Remove Coach',
            `Are you sure you want to remove ${coachName} from your approved coaches?`,
            async () => {
                try {
                    const coachId = coach._id || coach.userId || coach.id;

                    await handleUserRequest({
                        approverId: studentId,
                        requesterId: coachId,
                        action: 'removed',
                        feedback: 'Removed by student'
                    });

                    showAlert('Coach Removed', `${coachName} has been removed from your approved coaches.`);
                    await refreshCoachLists(studentId);
                } catch (error) {
                    console.error('Failed to remove coach:', error);
                    showAlert(
                        'Error',
                        `Could not remove coach. ${error.response?.data?.message || error.message || 'Please try again.'}`
                    );
                }
            }
        );
    };

    const handleViewProfile = async (coachId) => {
        try {
            // You may need to create a getCoachProfile API similar to getStudentProfile
            const res = await getStudentProfile(coachId); // Or getCoachProfile if available
            setProfileModal({ visible: true, coach: res.data });
        } catch {
            showAlert('Error', 'Failed to fetch coach profile.');
        }
    };

    const truncate = (str, maxLength) =>
        str && str.length > maxLength ? str.slice(0, maxLength) + '...' : str;

    if (!fontsLoaded) {
        return (
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centeredLight}>
                <Text style={scheme === 'dark' ? styles.loadingTextDark : styles.loadingTextLight}>Loading...</Text>
            </View>
        );
    }

    // Single coach card component for approved coaches (clickable)
    const ApprovedCoachCard = ({ coach, children }) => (
        <TouchableOpacity
            style={scheme === 'dark' ? styles.coachCardDark : styles.coachCardLight}
            onPress={() => handleViewProfile(coach._id)}
            activeOpacity={0.7}
        >
            <View style={styles.coachInfo}>
                <Text style={scheme === 'dark' ? styles.coachNameDark : styles.coachNameLight}>
                    {truncate(`${coach.firstName} ${coach.lastName}`, 20)}
                </Text>
                <Text style={scheme === 'dark' ? styles.coachEmailDark : styles.coachEmailLight}>
                    {coach.email || ''}
                </Text>
            </View>
            <View style={styles.buttonsRow}>{children}</View>
        </TouchableOpacity>
    );

    // Single coach card component for request list (non-clickable)
    const RequestCoachCard = ({ coach, children }) => (
        <View style={scheme === 'dark' ? styles.coachCardDark : styles.coachCardLight}>
            <View style={styles.coachInfo}>
                <Text style={scheme === 'dark' ? styles.coachNameDark : styles.coachNameLight}>
                    {truncate(`${coach.firstName} ${coach.lastName}`, 20)}
                </Text>
                <Text style={scheme === 'dark' ? styles.coachEmailDark : styles.coachEmailLight}>
                    {coach.email || ''}
                </Text>
            </View>
            <View style={styles.buttonsRow}>{children}</View>
        </View>
    );

    return (
        <View style={scheme === 'dark' ? styles.containerDark : styles.containerLight}>
            {/* Custom Header */}
            <CustomHeader
                title="My Coaches"
                onBackPress={() => {
                    if (router.canGoBack?.()) {
                        router.back();
                    } else {
                        router.replace('/student');
                    }
                }}
                showBackButton={true}
                defaultRoute="/student"
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={scheme === 'dark' ? styles.titleDark : styles.titleLight}>
                    Current Coaches
                </Text>

                {coaches.length === 0 ? (
                    <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyTextLight}>
                        No approved coaches yet.
                    </Text>
                ) : (
                    coaches.map((coach) => (
                        <ApprovedCoachCard key={coach._id} coach={coach}>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCoach(coach, `${coach.firstName} ${coach.lastName}`);
                                }}
                                style={scheme === 'dark' ? styles.removeBtnDark : styles.removeBtnLight}
                            >
                                <Text style={scheme === 'dark' ? styles.removeBtnTextDark : styles.removeBtnTextLight}>Remove</Text>
                            </TouchableOpacity>
                        </ApprovedCoachCard>
                    ))
                )}

                <Text style={scheme === 'dark' ? styles.titleSecondaryDark : styles.titleSecondaryLight}>
                    Add More Coaches
                </Text>

                {myRequests.length === 0 ? (
                    <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyTextLight}>
                        No more coaches to add.
                    </Text>
                ) : (
                    myRequests.map((coach) => (
                        <RequestCoachCard key={coach._id} coach={coach}>
                            {coach.status === 'requested' && coach.requestType === 'sent' ? (
                                <Text style={scheme === 'dark' ? styles.pendingTextDark : styles.pendingTextLight}>Pending</Text>
                            ) : coach.status === 'requested' && coach.requestType === 'received' ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleAcceptRequest(coach.userId)}
                                    >
                                        <Text
                                            style={scheme === 'dark' ? styles.acceptBtnDark : styles.acceptBtnLight}
                                        >
                                            ✔
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleRejectRequest(coach.userId)}
                                    >
                                        <Text
                                            style={scheme === 'dark' ? styles.rejectBtnDark : styles.rejectBtnLight}
                                        >
                                            ✖
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : coach.status === 'rejected' ? (
                                <Text style={scheme === 'dark' ? styles.rejectedTextDark : styles.rejectedTextLight}>Rejected</Text>
                            ) : (
                                <TouchableOpacity
                                    style={scheme === 'dark' ? styles.addBtnDark : styles.addBtnLight}
                                    onPress={() => handleRequest(coach.userId)}
                                >
                                    <Text style={styles.btnText}>Add</Text>
                                </TouchableOpacity>
                            )}
                        </RequestCoachCard>
                    ))
                )}
            </ScrollView>

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
                                    <Text style={styles.feedbackBtnText}>View Videos</Text>
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
    // Container styles
    containerLight: {
        flex: 1,
        backgroundColor: '#f4f8fb'
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#181c24'
    },

    // Centered loading styles
    centeredLight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f8fb'
    },
    centeredDark: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181c24'
    },

    // Loading text styles
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
        color: '#222f3e',
        fontFamily: 'Poppins_700Bold',
    },
    titleDark: {
        fontSize: 24,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#f5f6fa',
        fontFamily: 'Poppins_700Bold',
    },
    titleSecondaryLight: {
        fontSize: 24,
        marginTop: 38,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#222f3e',
        fontFamily: 'Poppins_700Bold',
    },
    titleSecondaryDark: {
        fontSize: 24,
        marginTop: 38,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#f5f6fa',
        fontFamily: 'Poppins_700Bold',
    },

    // Coach card styles
    coachCardLight: {
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
    coachCardDark: {
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

    // Coach info container
    coachInfo: {
        flex: 1,
    },

    // Coach name styles
    coachNameLight: {
        fontSize: 20,
        marginBottom: 2,
        letterSpacing: 0.1,
        color: '#222f3e',
        fontFamily: 'Poppins_600SemiBold',
    },
    coachNameDark: {
        fontSize: 20,
        marginBottom: 2,
        letterSpacing: 0.1,
        color: '#f5f6fa',
        fontFamily: 'Poppins_600SemiBold',
    },

    // Coach email styles
    coachEmailLight: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 2,
        color: '#7f8c8d',
        fontFamily: 'Poppins_400Regular',
    },
    coachEmailDark: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 2,
        color: '#aaaaaa',
        fontFamily: 'Poppins_400Regular',
    },

    // Buttons row
    buttonsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
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
        fontFamily: 'Poppins_600SemiBold',
    },
    removeBtnTextDark: {
        fontSize: 16,
        color: '#dc3545',
        fontFamily: 'Poppins_600SemiBold',
    },

    // Pending text styles
    pendingTextLight: {
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#7f8c8d',
        fontFamily: 'Poppins_400Regular',
    },
    pendingTextDark: {
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#aaaaaa',
        fontFamily: 'Poppins_400Regular',
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
        fontSize: 16,
        letterSpacing: 0.1,
        fontFamily: 'Poppins_600SemiBold',
    },

    // Rejected text styles
    rejectedTextLight: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#d9534f',
        fontFamily: 'Poppins_600SemiBold',
    },
    rejectedTextDark: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#d9534f',
        fontFamily: 'Poppins_600SemiBold',
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
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins_400Regular',
    },
    feedbackBtn: {
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#1976d2',
        alignItems: 'center',
    },
    feedbackBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
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
        fontFamily: 'Poppins_600SemiBold',
    },
});