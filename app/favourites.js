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
import { getVideos, toggleFavourite, deleteVideos } from '../services/api';
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
import { showConfirm, showAlert } from '../utils/alertMessage';

export default function Favourites() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [deleting, setDeleting] = useState(false);
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
            const token = await getToken();
            const user = jwtDecode(token);
            await toggleFavourite(videoId, { isFavourite: false, userId: user._id || user.id });

            // Remove video from local list to update UI immediately
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
        } catch (err) {
            console.error('Failed to unfavorite:', err);
        }
    };

    const handleVideoPress = (item) => {
        if (selectMode) {
            toggleVideoSelection(item._id);
        } else {
            router.push(`/video-review/${item._id}`);
        }
    };

    const handleVideoLongPress = (item) => {
        if (!selectMode) {
            setSelectMode(true);
            setSelectedVideos([item._id]);
        }
    };

    const toggleVideoSelection = (videoId) => {
        setSelectedVideos(prev => {
            if (prev.includes(videoId)) {
                const newSelection = prev.filter(id => id !== videoId);
                // Exit select mode if no videos selected
                if (newSelection.length === 0) {
                    setSelectMode(false);
                }
                return newSelection;
            } else {
                return [...prev, videoId];
            }
        });
    };

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelectedVideos([]);
    };

    const handleDeleteSelected = () => {
        if (selectedVideos.length === 0) return;

        showConfirm(
            'Delete Videos',
            `Are you sure you want to delete ${selectedVideos.length} video(s)? This action cannot be undone and will remove them from all videos as well.`,
            deleteSelectedVideos // onConfirm
        );
    };

    const deleteSelectedVideos = async () => {
        setDeleting(true);
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            await deleteVideos(selectedVideos, user._id || user.id);

            // Remove deleted videos from local state
            setVideos(prev => prev.filter(video => !selectedVideos.includes(video._id)));

            // Exit select mode
            exitSelectMode();
        } catch (err) {
            // console.error('Failed to delete videos:', err?.response?.data?.message || err);
            showAlert('Error', err?.response?.data?.message || err.message || 'Failed to delete videos. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const renderItem = (item) => {
        const isSelected = selectedVideos.includes(item._id);

        return (
            <TouchableOpacity
                key={item._id}
                style={[
                    scheme === 'dark' ? styles.cardDark : styles.card,
                    isSelected && styles.selectedCard
                ]}
                onPress={() => handleVideoPress(item)}

                onLongPress={() => handleVideoLongPress(item)}
                activeOpacity={0.9}
                delayLongPress={500}
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
                    {selectMode && (
                        <View style={styles.selectionOverlay}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.heartIcon}
                        onPress={() => toggleFavorite(item._id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.heartText}>{item.isFavourite ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={scheme === 'dark' ? styles.titleDark : styles.title}>{item.title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

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
                title={selectMode ? `${selectedVideos.length} Selected` : "Your Favourites"}
                onBackPress={() => {
                    if (selectMode) {
                        exitSelectMode();
                    } else {
                        router.replace(role === 'coach' ? '/coach' : '/student');
                    }
                }}
            />

            {selectMode && (
                <TouchableOpacity
                    style={styles.trashButton}
                    onPress={handleDeleteSelected}
                    activeOpacity={0.8}
                    disabled={selectedVideos.length === 0 || deleting}
                >
                    {deleting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.trashButtonText}>🗑️ Delete ({selectedVideos.length})</Text>
                    )}
                </TouchableOpacity>
            )}

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
    selectedCard: {
        borderColor: '#1976d2',
        borderWidth: 2,
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 8,
        backgroundColor: '#ccc',
    },
    selectionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    checkbox: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1976d2',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
    trashButton: {
        position: 'absolute',
        top: 20,
        right: 16,
        backgroundColor: '#ff4757',
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
    trashButtonText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
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