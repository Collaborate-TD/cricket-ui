import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    useColorScheme,
    ScrollView,
} from 'react-native';
import { getMatchUsers, requestCoach, getUnmatchUsers, handleUserRequest } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function CoachList() {
    const [coaches, setCoaches] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [studentId, setStudentId] = useState('');
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
                feedback: 'Request accepted.',
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
                feedback: 'Your request has been rejected.',
            });
            Alert.alert('Request Rejected', 'You have rejected the coach request.');
            await refreshCoachLists(studentId);
        } catch (err) {
            Alert.alert('Error', 'Could not reject request.');
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centeredLight}>
                <Text style={scheme === 'dark' ? styles.loadingTextDark : styles.loadingTextLight}>Loading...</Text>
            </View>
        );
    }

    // Single coach card component
    const CoachCard = ({ coach, children }) => (
        <View style={scheme === 'dark' ? styles.coachCardDark : styles.coachCardLight}>
            <View>
                <Text style={scheme === 'dark' ? styles.coachNameDark : styles.coachNameLight}>
                    {coach.firstName} {coach.lastName}
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
            {/* Back Button */}
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
                <Text style={scheme === 'dark' ? styles.backArrowDark : styles.backArrowLight}>←</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={scheme === 'dark' ? styles.titleDark : styles.titleLight}>
                    My Coaches
                </Text>

                {coaches.length === 0 ? (
                    <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyTextLight}>
                        No approved coaches yet.
                    </Text>
                ) : (
                    coaches.map((coach) => (
                        <CoachCard key={coach._id} coach={coach}>
                            <TouchableOpacity
                                onPress={() => router.push(`/pi/${coach._id}`)}
                                style={scheme === 'dark' ? styles.viewBtnDark : styles.viewBtnLight}
                            >
                                <Text style={scheme === 'dark' ? styles.actionBtnTextDark : styles.actionBtnTextLight}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push(`/chat/${coach._id}`)}
                                style={scheme === 'dark' ? styles.messageBtnDark : styles.messageBtnLight}
                            >
                                <Text style={scheme === 'dark' ? styles.actionBtnTextDark : styles.actionBtnTextLight}>Message</Text>
                            </TouchableOpacity>
                        </CoachCard>
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
                        <CoachCard key={coach._id} coach={coach}>
                            {coach.status === 'requested' && coach.requestType === 'sent' ? (
                                <Text style={scheme === 'dark' ? styles.pendingTextDark : styles.pendingTextLight}>Pending</Text>
                            ) : coach.status === 'requested' && coach.requestType === 'received' ? (
                                <>
                                    <TouchableOpacity
                                        style={scheme === 'dark' ? styles.acceptBtnDark : styles.acceptBtnLight}
                                        onPress={() => handleAcceptRequest(coach.userId)}
                                    >
                                        <Text style={styles.btnText}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={scheme === 'dark' ? styles.rejectBtnDark : styles.rejectBtnLight}
                                        onPress={() => handleRejectRequest(coach.userId)}
                                    >
                                        <Text style={styles.btnText}>Reject</Text>
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
                        </CoachCard>
                    ))
                )}
            </ScrollView>
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

    // Back button styles
    backButton: {
        position: 'absolute',
        top: 48,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        borderRadius: 8,
    },
    backArrowLight: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    backArrowDark: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#8ab4f8',
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
        fontSize: 28,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#222f3e',
        fontFamily: 'Poppins_700Bold',
    },
    titleDark: {
        fontSize: 28,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#f5f6fa',
        fontFamily: 'Poppins_700Bold',
    },
    titleSecondaryLight: {
        fontSize: 28,
        marginTop: 38,
        marginBottom: 18,
        letterSpacing: 0.2,
        color: '#222f3e',
        fontFamily: 'Poppins_700Bold',
    },
    titleSecondaryDark: {
        fontSize: 28,
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
    messageBtnLight: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
        borderColor: '#1976d2',
    },
    messageBtnDark: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
        borderColor: '#3b5998',
    },

    // Action button text styles
    actionBtnTextLight: {
        fontSize: 16,
        color: '#1976d2',
        fontFamily: 'Poppins_600SemiBold',
    },
    actionBtnTextDark: {
        fontSize: 16,
        color: '#3b5998',
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

    // Accept button styles
    acceptBtnLight: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#1976d2',
    },
    acceptBtnDark: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#3b5998',
    },

    // Reject button styles
    rejectBtnLight: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        backgroundColor: '#d9534f',
    },
    rejectBtnDark: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        backgroundColor: '#d9534f',
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
});