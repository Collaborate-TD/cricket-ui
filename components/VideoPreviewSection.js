import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import AnnotationToolbar from './AnnotationToolbar';
import AnnotationCanvas from './AnnotationCanvas';
import CommentInputModal from './CommentInputModal';
import CustomHeader from '../components/CustomHeader';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function VideoPreviewSection({ videoId, onAnnotate, annotations, setAnnotations }) {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customFullscreen, setCustomFullscreen] = useState(false);
    const [isCoach, setIsCoach] = useState(false);
    const [showAnnotationOverlay, setShowAnnotationOverlay] = useState(false);
    const [currentSecond, setCurrentSecond] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(1);
    const [selectedTool, setSelectedTool] = useState('freehand');
    const [selectedColor, setSelectedColor] = useState('#FF0000');
    const [selectedThickness, setSelectedThickness] = useState(4);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comment, setComment] = useState('');

    const videoRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true);
            try {
                let filter = {};
                const token = await getToken();
                const user = jwtDecode(token);
                filter.userId = user.id || user._id;
                const res = await getVideos(filter);
                const found = res.data.list.find(v => v._id === videoId);
                setVideo(found);
            } catch (err) {
                setVideo(null);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

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

    // Get video duration in seconds
    const handleVideoLoad = (status) => {
        const duration = status.durationMillis / 1000;
        setTotalSeconds(Math.ceil(duration));
    };

    // Seek video when currentSecond changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setStatusAsync({ positionMillis: currentSecond * 1000, shouldPlay: false });
        }
        // Load existing comment for this second
        const frameData = annotations[currentSecond] || { drawings: [], comment: '' };
        setComment(frameData.comment || '');
    }, [currentSecond]);

    // Save annotation for current second
    const handleSave = () => {
        setAnnotations((prev) => {
            const updated = [...prev];
            updated[currentSecond] = {
                ...updated[currentSecond],
                drawings: updated[currentSecond]?.drawings || [],
                comment: comment,
            };
            return updated;
        });
        setShowAnnotationOverlay(false);
    };

    // Handle drawing change
    const handleAnnotationChange = (second, newFrameData) => {
        setAnnotations((prev) => {
            const updated = [...prev];
            updated[second] = {
                ...updated[second],
                ...newFrameData,
                comment: comment, // keep comment in sync
            };
            return updated;
        });
    };

    // Only freehand tool enabled
    const handleSelectTool = (tool) => {
        if (tool === 'freehand') setSelectedTool(tool);
    };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
    if (!video) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 40 }}>Video not found.</Text>;

    return (
        <View style={styles.container}>
            <CustomHeader
                title={"Preview"}
                onBackPress={() => router.back()}
                showBackButton={true}
                defaultRoute="/student"
            />
            {customFullscreen ? (
                <View style={styles.fullscreenContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: video?.url }}
                        style={styles.fullscreenVideo}
                        useNativeControls
                        resizeMode="contain"
                        onLoad={handleVideoLoad}
                    />
                    {isCoach && !showAnnotationOverlay && (
                        <TouchableOpacity style={styles.annotateBtn} onPress={() => setShowAnnotationOverlay(true)}>
                            <Text style={styles.annotateBtnText}>Annotate</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.exitFullscreenBtn} onPress={() => {
                        setCustomFullscreen(false);
                        setShowAnnotationOverlay(false);
                    }}>
                        <Text style={styles.exitFullscreenText}>Exit Fullscreen</Text>
                    </TouchableOpacity>
                    {showAnnotationOverlay && (
                        <View style={styles.annotationOverlay}>
                            <AnnotationCanvas
                                frame={currentSecond}
                                frameData={annotations[currentSecond]}
                                onChange={(newFrameData) => handleAnnotationChange(currentSecond, newFrameData)}
                                selectedTool={selectedTool}
                                selectedColor={selectedColor}
                                selectedThickness={selectedThickness}
                            />
                            <AnnotationToolbar
                                selectedTool={selectedTool}
                                onSelectTool={handleSelectTool}
                                selectedColor={selectedColor}
                                onSelectColor={setSelectedColor}
                                selectedThickness={selectedThickness}
                                onSelectThickness={setSelectedThickness}
                                onAddComment={() => setShowCommentModal(true)}
                                onSave={handleSave}
                                onExit={() => setShowAnnotationOverlay(false)}
                            />
                            <CommentInputModal
                                visible={showCommentModal}
                                initialText={comment}
                                onSave={(text) => {
                                    setComment(text);
                                    setAnnotations((prev) => {
                                        const updated = [...prev];
                                        updated[currentSecond] = {
                                            ...updated[currentSecond],
                                            drawings: updated[currentSecond]?.drawings || [],
                                            comment: text,
                                        };
                                        return updated;
                                    });
                                    setShowCommentModal(false);
                                }}
                                onCancel={() => setShowCommentModal(false)}
                            />
                        </View>
                    )}
                </View>
            ) : (
                <View>
                    <Video
                        ref={videoRef}
                        source={{ uri: video?.url }}
                        style={styles.video}
                        useNativeControls
                        resizeMode="contain"
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
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb',
        paddingVertical: 16,
        paddingHorizontal: 0,
    },
    video: {
        width: '96%',
        aspectRatio: 16 / 20,
        backgroundColor: '#000',
        borderRadius: 16,
        alignSelf: 'center',
        maxWidth: 700,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    fullscreenContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#111',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0,
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 0,
    },
    videoId: {
        marginTop: 8,
        textAlign: 'center',
        color: '#888',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    annotateBtn: {
        position: 'absolute',
        top: 36,
        right: 28,
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    annotateBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    exitFullscreenBtn: {
        position: 'absolute',
        top: 36,
        left: 28,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        zIndex: 10,
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
    fullscreenBtn: {
        marginTop: 18,
        alignSelf: 'center',
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 24,
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
    annotationOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.10)',
        zIndex: 200,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
        width: '100%',
        height: '100%',
    },
});
