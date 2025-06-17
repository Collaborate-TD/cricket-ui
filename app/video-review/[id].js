import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Video } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVideos } from '../../services/api';
import { getToken } from '../../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

const { width, height } = Dimensions.get('window');

export default function VideoReview() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id;
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [fullscreenOpened, setFullscreenOpened] = useState(false);
    const [customFullscreen, setCustomFullscreen] = useState(false);
    const [annotationMode, setAnnotationMode] = useState(false);
    const [drawing, setDrawing] = useState('');
    const [comment, setComment] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const [annotations, setAnnotations] = useState([]); // {timestamp, drawing, comment}
    const [isCoach, setIsCoach] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true);
            try {
                let filter = {};
                const token = await getToken();
                const user = jwtDecode(token);

                if (params.studentId) {
                    filter.studentId = params.studentId;
                } else if (params.coachId) {
                    filter.coachId = params.coachId;
                } else {
                    filter.userId = user.id || user._id;
                }

                const res = await getVideos(filter);
                const found = res.data.list.find(v => v._id === id);
                setVideo(found);
            } catch (err) {
                setVideo(null);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id, params.studentId, params.coachId]);

    useEffect(() => {
        const checkRole = async () => {
            const token = await getToken();
            if (token) {
                const user = jwtDecode(token);
                setIsCoach(user.role === 'coach');
            }
        };
        checkRole();
    }, []);

    // Automatically present fullscreen when video is loaded
    const handleVideoReady = async () => {
        if (!fullscreenOpened && videoRef.current) {
            setFullscreenOpened(true);
            try {
                await videoRef.current.presentFullscreenPlayer();
            } catch (e) {
                // Ignore if not supported on web
            }
        }
    };

    const handleFullscreenUpdate = (event) => {
        // 3 means fullscreen exited
        if (event.fullscreenUpdate === 3) {
            setFullscreenOpened(false); // Reset the flag if needed
            router.replace('/all-videos'); // Go back to the video list
        }
    };

    // Drawing handlers (very basic)
    const handleTouchStart = (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDrawing(`M${locationX},${locationY}`);
    };
    const handleTouchMove = (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDrawing((prev) => prev + ` L${locationX},${locationY}`);
    };
    const handleTouchEnd = () => { };

    const handleAnnotate = async () => {
        if (videoRef.current) {
            const status = await videoRef.current.getStatusAsync();
            setCurrentTime(status.positionMillis);
            await videoRef.current.pauseAsync();
            setAnnotationMode(true);
        }
    };

    const handleSaveAnnotation = async () => {
        if (!drawing && !comment.trim()) {
            setAnnotationMode(false);
            return;
        }
        const newAnnotation = {
            timestamp: currentTime,
            drawing,
            comment,
            // Add coachId, studentId, videoId as needed
        };
        setAnnotations([...annotations, newAnnotation]);
        // TODO: Send newAnnotation to backend here

        setDrawing('');
        setComment('');
        setAnnotationMode(false);
        if (videoRef.current) await videoRef.current.playAsync();
    };

    const handleUndo = () => {
        setDrawing('');
        setComment('');
    };

    // Show overlays for students at correct times (basic example)
    const [playbackTime, setPlaybackTime] = useState(0);
    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded) setPlaybackTime(status.positionMillis);
    };
    const activeAnnotations = annotations.filter(
        (a) => Math.abs(a.timestamp - playbackTime) < 1000 // Show if within 1s of annotation
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
    if (!video) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 40 }}>Video not found.</Text>;

    return (
        <View style={styles.container}>
            {customFullscreen ? (
                <View style={styles.fullscreenContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: video?.url }}
                        style={styles.fullscreenVideo}
                        useNativeControls
                        resizeMode="contain"
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />
                    {isCoach && !annotationMode && (
                        <TouchableOpacity style={styles.annotateBtn} onPress={handleAnnotate}>
                            <Text style={styles.annotateBtnText}>Annotate</Text>
                        </TouchableOpacity>
                    )}
                    {annotationMode && (
                        <View style={styles.annotationOverlay} pointerEvents="box-none">
                            <Svg
                                style={StyleSheet.absoluteFill}
                                width={width}
                                height={height}
                                onStartShouldSetResponder={() => true}
                                onResponderGrant={handleTouchStart}
                                onResponderMove={handleTouchMove}
                                onResponderRelease={handleTouchEnd}
                            >
                                {drawing ? <Path d={drawing} stroke="red" strokeWidth={3} fill="none" /> : null}
                            </Svg>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={100} // Try increasing this value
                                style={{ width: '100%', alignItems: 'center' }}
                            >
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Add comment..."
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline
                                />
                                <View style={styles.overlayButtons}>
                                    <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}>
                                        <Text style={styles.undoBtnText}>Undo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAnnotation}>
                                        <Text style={styles.saveBtnText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                    )}
                    {/* Show overlays for students at correct times */}
                    {!annotationMode && activeAnnotations.map((a, i) => (
                        <View key={i} style={styles.studentOverlay}>
                            {a.drawing ? (
                                <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
                                    <Path d={a.drawing} stroke="red" strokeWidth={3} fill="none" />
                                </Svg>
                            ) : null}
                            {a.comment ? (
                                <View style={styles.commentBubble}>
                                    <Text style={styles.commentBubbleText}>{a.comment}</Text>
                                </View>
                            ) : null}
                        </View>
                    ))}
                    <TouchableOpacity style={styles.exitFullscreenBtn} onPress={() => setCustomFullscreen(false)}>
                        <Text style={styles.exitFullscreenText}>Exit Fullscreen</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <Video
                        ref={videoRef}
                        source={{ uri: video?.url }}
                        style={styles.video}
                        useNativeControls
                        resizeMode="contain"
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />
                    <TouchableOpacity style={styles.fullscreenBtn} onPress={() => setCustomFullscreen(true)}>
                        <Text style={styles.fullscreenBtnText}>Fullscreen</Text>
                    </TouchableOpacity>
                    <Text style={styles.videoTitle}>{video?.title || video?.fileName}</Text>
                    <Text style={styles.videoId}>Video ID: {video?._id}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 0 },
    backBtn: { marginBottom: 16 },
    backText: { fontSize: 18, color: '#1976d2' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    video: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: 8,
        alignSelf: 'center',
        maxWidth: 600, // optional
    },
    fullscreenContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#000',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    videoId: { marginTop: 16, textAlign: 'center', color: '#666' },
    annotateBtn: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
    },
    annotateBtnText: { color: '#fff', fontWeight: 'bold' },
    annotationOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 20,
    },
    commentInput: {
        width: '90%',
        minHeight: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        fontSize: 16,
    },
    overlayButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 40,
    },
    undoBtn: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginRight: 12,
    },
    undoBtnText: { color: '#1976d2', fontWeight: 'bold' },
    saveBtn: {
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 8,
    },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
    studentOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 15,
    },
    commentBubble: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 12,
        marginBottom: 60,
        maxWidth: '80%',
    },
    commentBubbleText: {
        color: '#222',
        fontSize: 16,
    },
    exitFullscreenBtn: {
        position: 'absolute',
        top: 30,
        left: 20,
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
    },
    exitFullscreenText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fullscreenBtn: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 20,
    },
    fullscreenBtnText: { color: '#fff', fontWeight: 'bold' },
    videoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
});