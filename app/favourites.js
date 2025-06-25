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
import { useRouter } from 'expo-router';
import { getVideos, toggleFavourite } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Video } from 'expo-av';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import CustomHeader from '../components/CustomHeader';

export default function Favourites() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const scheme = useColorScheme();
    const [role, setRole] = useState('student');

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    useEffect(() => {
        const fetchFavourites = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const user = jwtDecode(token);
                setRole(user.role);

                // Assuming your API can filter by isFavourite true
                const filter = {
                    userId: user.id || user._id,
                    isFavourite: true,
                };
                const res = await getVideos(filter);
                const fetchedVideos = res.data.list || [];
                setVideos(fetchedVideos.filter(v => v.isFavourite));
            } catch (err) {
                console.error('Failed to fetch favorite videos:', err);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFavourites();
    }, []);

    // Toggle favorite (unfavorite) — remove from local list after success
    const toggleFavorite = async (videoId) => {
        try {
            await toggleFavourite(videoId, false); // unfavorite on backend

            // Remove video from local list to update UI immediately
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
        } catch (err) {
            console.error('Failed to unfavorite:', err);
        }
    };

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
            <View style={styles.titleContainer}>
                <TouchableOpacity
                    style={styles.heartIcon}
                    onPress={() => toggleFavorite(item._id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.heartText}>{item.isFavourite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
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
                title="Your Favourites"
                onBackPress={() => router.replace(role === 'coach' ? '/coach' : '/student')}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {videos.length === 0 ? (
                        <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyText}>
                            No favorite videos yet.
                        </Text>
                    ) : (
                        videos.map(renderItem)
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Same styles as AllVideos page:
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
        paddingTop: 32,
        position: 'relative',
    },
    heartIcon: {
        position: 'absolute',
        right: 8,
        top: 4,
        padding: 4,
        zIndex: 1,
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