import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Video } from 'expo-av';

export default function AllVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('student'); // default to student
    const router = useRouter();
    const params = useLocalSearchParams();

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
                let filter = {};
                const token = await getToken();
                const user = jwtDecode(token);

                params.studentId && (filter.studentId = params.studentId);
                params.coachId && (filter.coachId = params.coachId);

                filter.userId = user.id || user._id;
                const res = await getVideos(filter);
                // console.log('Fetched Videos:', res.data);
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
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/video-review/${item._id}`)}>
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
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={{ marginBottom: 16 }}
                onPress={() => {
                    // Change route based on role
                    if (role === 'coach') {
                        router.replace('/coach');
                    } else {
                        router.replace('/student');
                    }
                }}
            >
                <Text style={{ fontSize: 18, color: '#1976d2' }}>← Back to Profile</Text>
            </TouchableOpacity>
            <Text style={styles.header}>Videos</Text>
            <FlatList
                data={videos}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                numColumns={2}
                ListEmptyComponent={
                    loading
                        ? <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading...</Text>
                        : <Text style={{ textAlign: 'center', marginTop: 32 }}>No videos yet.</Text>
                }
                ListFooterComponent={
                    <TouchableOpacity style={styles.newRecording} onPress={() => router.push('/record-video')}>
                        <Text style={styles.newRecordingIcon}>🎥</Text>
                        <Text>New Recording</Text>
                    </TouchableOpacity>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 0 },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    card: {
        flex: 1,
        margin: 8,
        alignItems: 'stretch',
        backgroundColor: '#eee',
        borderRadius: 8,
        // Remove padding here to allow thumbnail to fill width
        minWidth: 0,
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 8,
        backgroundColor: '#ccc',
    },
    title: { marginTop: 8, fontWeight: 'bold', textAlign: 'center' },
    newRecording: {
        flex: 1,
        margin: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1976d2',
        borderRadius: 8,
        padding: 16
    },
    newRecordingIcon: { fontSize: 40, marginBottom: 8 },
    video: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: 8,
        alignSelf: 'center',
        maxWidth: 600,
    },
});