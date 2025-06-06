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

    const colors =
        scheme === 'dark'
            ? {
                background: '#181c24',
                cardBackground: '#23243a',
                textPrimary: '#f5f6fa',
                textSecondary: '#aaaaaa',
                btnPrimary: '#3b5998',
                btnDanger: '#d9534f',
                shadow: 'rgba(0, 0, 0, 0.7)',
                backArrow: '#8ab4f8',
                divider: '#2e3350',
            }
            : {
                background: '#f4f8fb',
                cardBackground: '#fff',
                textPrimary: '#222f3e',
                textSecondary: '#7f8c8d',
                btnPrimary: '#1976d2',
                btnDanger: '#d9534f',
                shadow: 'rgba(25, 118, 210, 0.08)',
                backArrow: '#1976d2',
                divider: '#e6e6e6',
            };

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
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>Loading...</Text>
            </View>
        );
    }

    // Single coach card component
    const CoachCard = ({ coach, children }) => (
        <View style={[
            styles.coachCard,
            {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
                borderColor: colors.divider,
            }
        ]}>
            <View>
                <Text style={[
                    styles.coachName,
                    { color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' }
                ]}>
                    {coach.firstName} {coach.lastName}
                </Text>
                <Text style={[
                    styles.coachEmail,
                    { color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }
                ]}>
                    {coach.email || ''}
                </Text>
            </View>
            <View style={styles.buttonsRow}>{children}</View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                <Text style={[styles.backArrow, { color: colors.backArrow }]}>←</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[
                    styles.title,
                    { color: colors.textPrimary, fontFamily: 'Poppins_700Bold' }
                ]}>
                    My Coaches
                </Text>

                {coaches.length === 0 ? (
                    <Text style={[
                        styles.emptyText,
                        { color: colors.textSecondary }
                    ]}>
                        No approved coaches yet.
                    </Text>
                ) : (
                    coaches.map((coach) => (
                        <CoachCard key={coach._id} coach={coach}>
                            <TouchableOpacity
                                onPress={() => router.push(`/pi/${coach._id}`)}
                                style={[styles.actionBtn, styles.viewBtn, { borderColor: colors.btnPrimary }]}
                            >
                                <Text style={[
                                    styles.actionBtnText,
                                    { color: colors.btnPrimary, fontFamily: 'Poppins_600SemiBold' }
                                ]}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push(`/chat/${coach._id}`)}
                                style={[styles.actionBtn, styles.messageBtn, { borderColor: colors.btnPrimary }]}
                            >
                                <Text style={[
                                    styles.actionBtnText,
                                    { color: colors.btnPrimary, fontFamily: 'Poppins_600SemiBold' }
                                ]}>Message</Text>
                            </TouchableOpacity>
                        </CoachCard>
                    ))
                )}

                <Text style={[
                    styles.title,
                    { marginTop: 38, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' }
                ]}>
                    Add More Coaches
                </Text>

                {myRequests.length === 0 ? (
                    <Text style={[
                        styles.emptyText,
                        { color: colors.textSecondary }
                    ]}>
                        No more coaches to add.
                    </Text>
                ) : (
                    myRequests.map((coach) => (
                        <CoachCard key={coach._id} coach={coach}>
                            {coach.status === 'requested' && coach.requestType === 'sent' ? (
                                <Text style={[
                                    styles.pendingText,
                                    { color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }
                                ]}>Pending</Text>
                            ) : coach.status === 'requested' && coach.requestType === 'received' ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.acceptBtn, { backgroundColor: colors.btnPrimary }]}
                                        onPress={() => handleAcceptRequest(coach.userId)}
                                    >
                                        <Text style={[
                                            styles.btnText,
                                            { fontFamily: 'Poppins_600SemiBold' }
                                        ]}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.rejectBtn, { backgroundColor: colors.btnDanger }]}
                                        onPress={() => handleRejectRequest(coach.userId)}
                                    >
                                        <Text style={[
                                            styles.btnText,
                                            { fontFamily: 'Poppins_600SemiBold' }
                                        ]}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            ) : coach.status === 'rejected' ? (
                                <Text style={[
                                    styles.rejectedText,
                                    { color: colors.btnDanger, fontFamily: 'Poppins_600SemiBold' }
                                ]}>Rejected</Text>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.addBtn, { backgroundColor: colors.btnPrimary }]}
                                    onPress={() => handleRequest(coach.userId)}
                                >
                                    <Text style={[
                                        styles.btnText,
                                        { fontFamily: 'Poppins_600SemiBold' }
                                    ]}>Add</Text>
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
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    backButton: {
        position: 'absolute',
        top: 48,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        borderRadius: 8,
    },
    backArrow: {
        fontSize: 32,
        fontWeight: 'bold',
    },

    scrollContent: {
        padding: 24,
        paddingBottom: 48,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },

    title: {
        fontSize: 28,
        marginBottom: 18,
        letterSpacing: 0.2,
    },

    coachCard: {
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
    },

    coachName: {
        fontSize: 20,
        marginBottom: 2,
        letterSpacing: 0.1,
    },
    coachEmail: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 2,
    },

    buttonsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },

    actionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginLeft: 4,
        backgroundColor: 'transparent',
    },
    viewBtn: {},
    messageBtn: {},

    actionBtnText: {
        fontSize: 16,
    },

    pendingText: {
        fontSize: 16,
        fontStyle: 'italic',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    addBtn: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        marginLeft: 4,
    },

    acceptBtn: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
        marginRight: 8,
    },

    rejectBtn: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8,
    },

    btnText: {
        color: '#fff',
        fontSize: 16,
        letterSpacing: 0.1,
    },

    rejectedText: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
        opacity: 0.8,
    },
});