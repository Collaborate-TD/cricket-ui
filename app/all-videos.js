import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    useColorScheme,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos, toggleFavourite } from '../services/api';
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
import CustomHeader from '../components/CustomHeader';

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

    const toggleFavorite = async (videoId) => {
        const currentVideo = videos.find(v => v._id === videoId);
        if (!currentVideo) return;

        const newValue = !currentVideo.isFavourite;

        try {
            setVideos(prev =>
                prev.map(video =>
                    video._id === videoId ? { ...video, isFavourite: newValue } : video
                )
            );

            await toggleFavourite(videoId, newValue);
        } catch (err) {
            console.error(err);
            // Optional: revert UI
            setVideos(prev =>
                prev.map(video =>
                    video._id === videoId ? { ...video, isFavourite: !newValue } : video
                )
            );
        }
    };


    const handleVideoPress = (item) => {
        router.push(`/video-review/${item._id}`);
    };

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

    // Calculate favorites count from videos array
    const favoritesCount = videos.filter(video => video.isFavourite).length;

    const renderItem = (item) => (
        <TouchableOpacity
            key={item._id}
            style={scheme === 'dark' ? styles.cardDark : styles.card}
            onPress={() => router.push(`/video-review/${item._id}`)}
            activeOpacity={0.9}
        >
            <View style={{ position: 'relative' }}>
                <Video
                    source={{ uri: item.url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    isMuted
                    shouldPlay={false}
                    usePoster={!!item.thumbnailUrl}
                    posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
                />
                <TouchableOpacity
                    style={styles.heartIcon}
                    onPress={() => toggleFavorite(item._id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.heartText}>
                        {item.isFavourite ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
                <Text style={scheme === 'dark' ? styles.titleDark : styles.title}>{item.title}</Text>
            </View>
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
            <CustomHeader
                title="Your Videos"
                onBackPress={() => router.replace(role === 'coach' ? '/coach' : '/student')}
            />

            <TouchableOpacity
                style={styles.favoritesButton}
                onPress={() => router.push('/favourites')}
                activeOpacity={0.8}
            >
                <Text style={styles.favoritesButtonText}>❤️ {favoritesCount}</Text>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb',
    },
    containerDark: {
        flex: 1,
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
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
    favoritesButton: {
        position: 'absolute',
        top: 20,
        right: 16,
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    favoritesButtonText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
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
        borderRadius: 8,
        backgroundColor: '#ccc',
    },
    titleContainer: {
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 0,
        position: 'relative',
    },
    heartIcon: {
        position: 'absolute',
        right: 5,
        top: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    heartText: {
        fontSize: 20,
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