import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Video } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleFavourite } from '../services/api';

export default function AllVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('student');
    const [favorites, setFavorites] = useState([]);
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        const getRole = async () => {
            const token = await getToken();
            const user = jwtDecode(token);
            setRole(user.role || 'student');
        };
        getRole();
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            const userId = user.id || user._id;
            const favoritesKey = `favorites_${userId}`;
            const storedFavorites = await AsyncStorage.getItem(favoritesKey);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const saveFavorites = async (newFavorites) => {
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            const userId = user.id || user._id;
            const favoritesKey = `favorites_${userId}`;
            await AsyncStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    const toggleFavorite = async (videoId) => {
        const isFavorite = favorites.includes(videoId);
        let newFavorites;
        
        if (isFavorite) {
            newFavorites = favorites.filter(id => id !== videoId);
        } else {
            newFavorites = [...favorites, videoId];
        }
        
        // Save to local storage
        await saveFavorites(newFavorites);
        
        // Also try to update backend if available
        try {
            await toggleFavourite(videoId);
        } catch (error) {
            console.log('Backend favorite toggle failed, using local storage only');
        }
    };

    const handleVideoPress = (item) => {
        router.push(`/video-review/${item._id}`);
    };

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                let filter = {};
                const token = await getToken();
                const user = jwtDecode(token);

                params.studentId && (filter.studentId = params.studentId);
                params.coachId && (filter.coachId = params.coachId);

                filter.userId = user.id || user._id;
                const res = await getVideos(filter);
                setVideos(res.data.list);
            } catch (err) {
                console.error('Failed to fetch videos:', err);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [params.studentId, params.coachId]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => handleVideoPress(item)}>
                <View style={styles.videoContainer}>
                    <Video
                        source={{ uri: item.url }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        isMuted
                        shouldPlay={false}
                        {...(item.thumbnailUrl
                            ? {
                                usePoster: true,
                                posterSource: { uri: item.thumbnailUrl }
                            }
                            : {})}
                    />
                </View>
            </TouchableOpacity>
            
            {/* Heart Icon positioned above title */}
            <View style={styles.titleContainer}>
                <TouchableOpacity
                    style={styles.heartIcon}
                    onPress={() => toggleFavorite(item._id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.heartText}>
                        {favorites.includes(item._id) ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.title}>{item.title}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (role === 'coach') {
                            router.replace('/coach');
                        } else {
                            router.replace('/student');
                        }
                    }}
                >
                    <Text style={styles.backButtonText}>← Back to Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.favoritesButton}
                    onPress={() => router.push('/favourites')}
                >
                    <Text style={styles.favoritesButtonText}>❤️ Favorites ({favorites.length})</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.header}>Videos</Text>
            
            <TouchableOpacity style={styles.newRecordingTop} onPress={() => {
                if (params.studentId) {
                    router.push(`/record-video?studentId=${params.studentId}`);
                } else {
                    router.push('/record-video');
                }
            }}>
                <Text style={styles.newRecordingIcon}>🎥</Text>
                <Text style={styles.newRecordingText}>New Recording</Text>
            </TouchableOpacity>
            
            <FlatList
                data={videos}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                numColumns={2}
                ListEmptyComponent={
                    loading
                        ? <Text style={styles.emptyText}>Loading...</Text>
                        : <Text style={styles.emptyText}>No videos yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff', 
        paddingVertical: 16, 
        paddingHorizontal: 16 
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    backButton: {
        flex: 1
    },
    backButtonText: { 
        fontSize: 18, 
        color: '#1976d2' 
    },
    favoritesButton: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    favoritesButtonText: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500'
    },
    header: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginBottom: 16 
    },
    card: {
        flex: 1,
        margin: 8,
        alignItems: 'stretch',
        backgroundColor: '#eee',
        borderRadius: 8,
        minWidth: 0,
        paddingBottom: 8,
    },
    videoContainer: {
        position: 'relative',
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
        paddingTop: 8,
        position: 'relative',
        paddingTop: 32, // Extra space for the heart icon
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
        fontWeight: 'bold', 
        textAlign: 'center',
        fontSize: 14,
        marginTop: 4,
    },
    newRecordingTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e3f2fd',
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1976d2',
    },
    newRecordingIcon: { 
        fontSize: 20, 
        marginRight: 8 
    },
    newRecordingText: {
        fontSize: 16,
        color: '#1976d2',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
        color: '#666'
    }
});