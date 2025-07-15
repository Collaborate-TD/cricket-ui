import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDrill } from '../../services/api';
import { Video } from 'expo-av';
import { API_URL } from '@env';
import CustomHeader from '../../components/CustomHeader';

const DrillReviewScreen = () => {
    const { id: drillId } = useLocalSearchParams();
    const router = useRouter();
    const [drill, setDrill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        const fetchDrill = async () => {
            setLoading(true);
            try {
                const res = await getDrill(drillId);
                const found = Array.isArray(res.data) ? res.data[0] : res.data;
                setDrill(found);
            } catch (e) {
                setDrill(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDrill();
    }, [drillId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!drill) {
        return (
            <View style={styles.centered}>
                <Text style={{ fontSize: 18, color: '#666' }}>Drill not found.</Text>
            </View>
        );
    }

    const videoUri = drill.url && drill.url.startsWith('http')
        ? drill.url
        : `${API_URL}/uploads/${drill.fileName}`;

    return (
        <View style={styles.container}>
            {!fullscreen && (
                <CustomHeader
                    title="Drill Preview"
                    onBackPress={() => router.back()}
                    showBackButton={true}
                    defaultRoute="/drills"
                />
            )}
            {fullscreen ? (
                <View style={styles.fullscreenContainer}>
                    <Video
                        source={{ uri: videoUri }}
                        style={styles.fullscreenVideo}
                        useNativeControls
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.exitFullscreenBtn}
                        onPress={() => setFullscreen(false)}
                    >
                        <Text style={styles.exitFullscreenText}>Exit Fullscreen</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.previewContainer}>
                    <Video
                        source={{ uri: videoUri }}
                        style={styles.previewVideo}
                        useNativeControls
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.fullscreenBtn}
                        onPress={() => setFullscreen(true)}
                    >
                        <Text style={styles.fullscreenBtnText}>Fullscreen</Text>
                    </TouchableOpacity>
                    <Text style={styles.videoTitle}>{drill.title || drill.fileName}</Text>
                    <Text style={styles.videoId}>Drill ID: {drill._id}</Text>
                    {drill.description ? (
                        <Text style={styles.description}>{drill.description}</Text>
                    ) : null}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb',
        paddingVertical: 16,
        paddingHorizontal: 0,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f8fb',
    },
    fullscreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 0,
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 0,
        alignSelf: 'center',
        maxWidth: '100%',
    },
    exitFullscreenBtn: {
        position: 'absolute',
        top: 36,
        left: 28,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        zIndex: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    exitFullscreenText: {
        color: '#1976d2',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0,
    },
    previewVideo: {
        width: '100%',
        aspectRatio: 16 / 21,
        backgroundColor: '#000',
        borderRadius: 16,
        alignSelf: 'center',
        maxWidth: 700,
        margin: 16,
        height: '75%',
    },
    fullscreenBtn: {
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 3,
    },
    fullscreenBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 4,
        textAlign: 'center',
        color: '#222f3e',
        letterSpacing: 0.5,
    },
    videoId: {
        marginTop: 8,
        textAlign: 'center',
        color: '#888',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    description: {
        marginTop: 12,
        textAlign: 'center',
        color: '#444',
        fontSize: 15,
    },
});

export default DrillReviewScreen;