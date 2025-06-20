// FavouritePage.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Switch,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { useRouter, useFocusEffect } from 'expo-router';
import { getFavourites, toggleFavourite, getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import CustomHeader from '../components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavouritesPage() {
    const [favourites, setFavourites] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [viewType, setViewType] = useState('grid');
    const [loading, setLoading] = useState(true);
    const [localFavorites, setLocalFavorites] = useState([]);
    const router = useRouter();

    // Load local favorites from AsyncStorage
    const loadLocalFavorites = async () => {
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            const userId = user.id || user._id;
            const favoritesKey = `favorites_${userId}`;
            const storedFavorites = await AsyncStorage.getItem(favoritesKey);
            if (storedFavorites) {
                setLocalFavorites(JSON.parse(storedFavorites));
                return JSON.parse(storedFavorites);
            }
            return [];
        } catch (error) {
            console.error('Error loading local favorites:', error);
            return [];
        }
    };

    // Save local favorites to AsyncStorage
    const saveLocalFavorites = async (newFavorites) => {
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            const userId = user.id || user._id;
            const favoritesKey = `favorites_${userId}`;
            await AsyncStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
            setLocalFavorites(newFavorites);
        } catch (error) {
            console.error('Error saving local favorites:', error);
        }
    };

    // Fetch favorites from both backend and local storage
    const fetchFavourites = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            
            // Load local favorites
            const localFavIds = await loadLocalFavorites();
            
            // Try to get favorites from backend first
            let backendFavorites = [];
            try {
                const res = await getFavourites(user.id);
                backendFavorites = res.data || [];
            } catch (backendError) {
                console.log('Backend favorites not available, using local storage');
            }
            
            // If we have local favorites but no backend favorites, fetch videos and filter
            if (localFavIds.length > 0 && backendFavorites.length === 0) {
                try {
                    const filter = { userId: user.id || user._id };
                    const videosRes = await getVideos(filter);
                    const allVideos = videosRes.data.list || [];
                    
                    // Filter videos that are in local favorites
                    const localFavoriteVideos = allVideos.filter(video => 
                        localFavIds.includes(video._id)
                    ).map(video => ({
                        ...video,
                        type: 'video',
                        coachName: video.coach?.name || 'Unknown',
                        date: new Date(video.createdAt).toLocaleDateString(),
                        tags: video.tags || [],
                        note: video.note || ''
                    }));
                    
                    setFavourites(localFavoriteVideos);
                    setFiltered(localFavoriteVideos);
                } catch (videoError) {
                    console.error('Error fetching videos for local favorites:', videoError);
                    setFavourites([]);
                    setFiltered([]);
                }
            } else {
                // Use backend favorites
                setFavourites(backendFavorites);
                setFiltered(backendFavorites);
            }
        } catch (e) {
            console.error('Failed to fetch favourites:', e);
            setFavourites([]);
            setFiltered([]);
        } finally {
            setLoading(false);
        }
    };

    // Refresh favorites when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchFavourites();
        }, [])
    );

    const handleSearch = (text) => {
        setSearchText(text);
        const filteredData = favourites.filter(item =>
            item.title.toLowerCase().includes(text.toLowerCase())
        );
        setFiltered(filteredData);
    };

    const handleUnfavourite = async (id) => {
        Alert.alert(
            "Remove from Favorites",
            "Are you sure you want to remove this video from your favorites?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Try to toggle in backend first
                            try {
                                await toggleFavourite(id);
                            } catch (backendError) {
                                console.log('Backend toggle failed, updating local storage only');
                            }
                            
                            // Update local favorites
                            const newLocalFavorites = localFavorites.filter(favId => favId !== id);
                            await saveLocalFavorites(newLocalFavorites);
                            
                            // Update displayed favorites
                            const newFavorites = favourites.filter(item => item._id !== id);
                            setFavourites(newFavorites);
                            setFiltered(newFavorites.filter(item =>
                                item.title.toLowerCase().includes(searchText.toLowerCase())
                            ));
                        } catch (error) {
                            console.error('Error removing favorite:', error);
                            Alert.alert("Error", "Failed to remove from favorites. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const clearAllFavorites = () => {
        Alert.alert(
            "Clear All Favorites",
            "Are you sure you want to remove all videos from your favorites?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Clear local favorites
                            await saveLocalFavorites([]);
                            
                            // Clear displayed favorites
                            setFavourites([]);
                            setFiltered([]);
                        } catch (error) {
                            console.error('Error clearing favorites:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleVideoPress = (item) => {
        router.push(`/video-review/${item._id}`);
    };

    const renderItem = ({ item }) => (
        <View style={viewType === 'list' ? styles.listCard : styles.card}>
            <TouchableOpacity onPress={() => handleVideoPress(item)}>
                {item.type === 'video' ? (
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
                        <View style={styles.favoriteIndicator}>
                            <Text style={styles.favoriteIcon}>❤️</Text>
                        </View>
                    </View>
                ) : (
                    <Image source={{ uri: item.url }} style={styles.thumbnail} />
                )}
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>Coach: {item.coachName}</Text>
                    <Text style={styles.meta}>Date: {item.date}</Text>
                    <Text style={styles.meta}>Tags: {item.tags?.join(', ') || 'None'}</Text>
                    <Text style={styles.notes}>Note: {item.note || 'No notes added'}</Text>
                </View>
            </TouchableOpacity>
            
            {/* Remove Button */}
            <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => handleUnfavourite(item._id)}
            >
                <Text style={styles.removeButtonText}>💔 Remove from Favorites</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader 
                    title="Your Favourites"
                    defaultRoute="/student"
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1976d2" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader 
                title={`Your Favourites (${filtered.length})`}
                defaultRoute="/student"
            />
            
            <View style={styles.content}>
                <View style={styles.controls}>
                    <TextInput
                        value={searchText}
                        onChangeText={handleSearch}
                        placeholder="Search by title..."
                        style={styles.search}
                    />
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Grid View</Text>
                        <Switch
                            value={viewType === 'grid'}
                            onValueChange={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
                        />
                        {favourites.length > 0 && (
                            <TouchableOpacity 
                                style={styles.clearAllButton}
                                onPress={clearAllFavorites}
                            >
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {filtered.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>💔</Text>
                        <Text style={styles.emptyText}>
                            {searchText ? 'No favorites match your search!' : "You haven't saved any favourites yet!"}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/all-videos')}>
                            <Text style={styles.browseBtn}>Browse Videos</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                        numColumns={viewType === 'grid' ? 1 : 1}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb'
    },
    content: {
        flex: 1,
        padding: 16,
    },
    controls: {
        marginBottom: 16
    },
    search: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        marginBottom: 12,
        fontSize: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    toggleLabel: {
        marginRight: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    clearAllButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8
    },
    clearAllText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    videoContainer: {
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#ddd',
    },
    favoriteIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteIcon: {
        fontSize: 16,
    },
    infoContainer: {
        padding: 12
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    meta: {
        fontSize: 12,
        color: '#777',
        marginBottom: 2,
    },
    notes: {
        fontSize: 13,
        marginVertical: 4,
        color: '#555',
    },
    removeButton: {
        backgroundColor: '#ffe6e6',
        marginHorizontal: 12,
        marginBottom: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffb3b3',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#d63384',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
        textAlign: 'center',
    },
    browseBtn: {
        fontSize: 16,
        color: '#1976d2',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    flatListContent: {
        paddingBottom: 32
    },
});