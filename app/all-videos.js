import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function AllVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('student');
    const router = useRouter();
    const params = useLocalSearchParams();
    const scheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    useEffect(() => {
        const getRole = async () => {
            const token = await getToken();
            const user = jwtDecode(token);
            setRole(user.role || 'student');
        };
        getRole();
    }, []);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const user = jwtDecode(token);
                const filter = {
                    ...(params.studentId && { studentId: params.studentId }),
                    ...(params.coachId && { coachId: params.coachId }),
                    userId: user.id || user._id,
                };
                const res = await getVideos(filter);
                setVideos(res.data.list || []);
            } catch (err) {
                console.error('Failed to fetch videos:', err);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [params.studentId, params.coachId]);

    const renderItem = (item) => (
        <TouchableOpacity
            key={item._id}
            style={scheme === 'dark' ? styles.cardDark : styles.card}
            onPress={() => router.push(`/video-review/${item._id}`)}
            activeOpacity={0.9}
        >
            <Video
                source={{ uri: item.url }}
                style={styles.thumbnail}
                resizeMode="cover"
                isMuted
                shouldPlay={false}
                usePoster={!!item.thumbnailUrl}
                posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
            />
            <Text style={scheme === 'dark' ? styles.titleDark : styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    if (!fontsLoaded || loading) {
        return (
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centered}>
                <ActivityIndicator size="large" color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
            </View>
        );
    }

    return (
        <View style={scheme === 'dark' ? styles.containerDark : styles.container}>
            <TouchableOpacity
                onPress={() => router.replace(role === 'coach' ? '/coach' : '/student')}
                style={styles.backBtn}
            >
                <Text style={scheme === 'dark' ? styles.backTextDark : styles.backText}>← Back to Profile</Text>
            </TouchableOpacity>

            <Text style={scheme === 'dark' ? styles.headerDark : styles.header}>Your Videos</Text>

            <TouchableOpacity
                onPress={() =>
                    router.push(
                        params.studentId
                            ? `/record-video?studentId=${params.studentId}`
                            : '/record-video'
                    )
                }
                activeOpacity={0.8}
                style={styles.newRecordingContainer}
            >
                <LinearGradient
                    colors={['#8ab4f8', '#1976d2']}
                    style={styles.newRecording}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.recordIcon}>🎥</Text>
                    <Text style={styles.recordText}>New Recording</Text>
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.grid}>
                {videos.length === 0 ? (
                    <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyText}>No videos yet.</Text>
                ) : (
                    videos.map(renderItem)
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 28,
        backgroundColor: '#f4f8fb',
    },
    containerDark: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 28,
        backgroundColor: '#181c24',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f8fb',
    },
    centeredDark: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181c24',
    },
    backBtn: {
        marginBottom: 16,
    },
    backText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#1976d2',
    },
    backTextDark: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#8ab4f8',
    },
    header: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 12,
        color: '#222f3e',
    },
    headerDark: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 12,
        color: '#f5f6fa',
    },
    newRecordingContainer: {
        marginBottom: 20,
    },
    newRecording: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    recordIcon: {
        fontSize: 36,
        marginBottom: 8,
        color: '#fff',
    },
    recordText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#fff',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
    },
    cardDark: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: '#23243a',
        borderColor: '#333',
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#ccc',
    },
    title: {
        padding: 10,
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center',
        color: '#222f3e',
    },
    titleDark: {
        padding: 10,
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center',
        color: '#f5f6fa',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingTop: 40,
        fontFamily: 'Poppins_400Regular',
        width: '100%',
        color: '#222f3e',
    },
    emptyTextDark: {
        fontSize: 16,
        textAlign: 'center',
        paddingTop: 40,
        fontFamily: 'Poppins_400Regular',
        width: '100%',
        color: '#f5f6fa',
    },
});
