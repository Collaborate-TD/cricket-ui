import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av';
import { getVideos } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import AnnotationToolbar from './AnnotationToolbar';
import AnnotationCanvas from './AnnotationCanvas';
import CommentInputModal from './CommentInputModal';
import CustomHeader from '../components/CustomHeader';
import { useRouter } from 'expo-router';
import FrameNavigation from './FrameNavigation';

const { width, height } = Dimensions.get('window');

export default function VideoPreviewSection({
    videoId,
    onAnnotate,
    annotations,
    setAnnotations,
    onSaveFinal,
}) {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customFullscreen, setCustomFullscreen] = useState(false);
    const [isCoach, setIsCoach] = useState(false);
    const [showAnnotationOverlay, setShowAnnotationOverlay] = useState(false);
    const [totalSeconds, setTotalSeconds] = useState(5);

    const selectedToolRef = useRef('freehand');
    const selectedColorRef = useRef('#FF0000');
    const selectedThicknessRef = useRef(4);

    const annotationCanvasRef = useRef(); // for undo

    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comment, setComment] = useState('');
    const [hasSavedFrames, setHasSavedFrames] = useState(false);

    // New state for student annotation viewing
    const [studentViewingAnnotations, setStudentViewingAnnotations] = useState(false);
    const [hasAnnotations, setHasAnnotations] = useState(false);

    const videoRef = useRef(null);
    const router = useRouter();
    const currentSecondRef = useRef(0);
    const [, forceUpdate] = useState(0); // for manual re-render

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
        const checkIfCoach = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const user = jwtDecode(token);
                    setIsCoach(user.role === 'coach');
                    console.log('User role:', user.role);
                }
            } catch (error) {
                console.error('Error checking coach status:', error);
            }
        };

        checkIfCoach();
    }, []);

    // Check if annotations exist
    useEffect(() => {
        if (annotations && Object.keys(annotations).length > 0) {
            const hasValidAnnotations = Object.values(annotations).some(frame =>
                frame && (
                    (Array.isArray(frame.drawings) && frame.drawings.length > 0) ||
                    !!frame.comment
                )
            );
            setHasAnnotations(hasValidAnnotations);
        } else {
            setHasAnnotations(false);
        }
    }, [annotations]);

    const handleVideoLoad = (status) => {
        const duration = status.durationMillis / 1000;
        setTotalSeconds(Math.ceil(duration));
    };

    // FIX: Load comment after currentSecond updates
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setStatusAsync({ positionMillis: currentSecondRef.current * 1000, shouldPlay: false });
        }
        const frameData = annotations[currentSecondRef.current];
        if (frameData) {
            setComment(frameData.comment || '');
        } else {
            setComment('');
        }
    }, [annotations, forceUpdate]);

    // Clear entire frame annotation
    const handleDeleteAll = () => {
        const second = currentSecondRef.current;
        setAnnotations(prev => {
            const updated = { ...prev };
            if (!updated[second]) {
                updated[second] = { drawings: [], comment: '' };
            }
            updated[second] = {
                ...updated[second],
                drawings: [], // ✅ clear all drawings
            };
            return updated;
        });

        // also trigger canvas re-render
        forceUpdate(n => n + 1);
    };


    // FIXED: Correctly handle annotation changes - no more duplication
    const handleAnnotationChange = (second, newFrameData) => {
        setAnnotations(prev => {
            const updated = { ...prev };
            // Ensure the frame exists
            if (!updated[second]) {
                updated[second] = { drawings: [], comment: '' };
            }
            // Simply assign the new drawings (don't concatenate to avoid duplication)
            updated[second] = {
                ...updated[second],
                drawings: newFrameData.drawings,
                comment: comment,
            };
            return updated;
        });
        setHasSavedFrames(true);
    };

    // Update only the ref for tool
    const setSelectedTool = (tool) => {
        selectedToolRef.current = tool;
        forceUpdate(n => n + 1); // force update if you want UI to reflect selection
    };
    // Update only the ref for color
    const setSelectedColor = (color) => {
        selectedColorRef.current = color;
        forceUpdate(n => n + 1);
        console.log("Selected color updated:", selectedColorRef.current);
    };
    // Update only the ref for thickness
    const setSelectedThickness = (thickness) => {
        selectedThicknessRef.current = thickness;
        forceUpdate(n => n + 1);
    };

    // REMOVED: Auto-show annotations during playback for students
    // Students now need to manually click "View Annotations" button
    const handleVideoProgress = (playbackStatus) => {
        // This function is now empty for students - no auto-annotation display
        // Coaches can still use annotation overlay manually
    };

    // FIX: Frame navigation function
    const handleFrameChange = (second) => {
        if (isCoach) {
            setAnnotations(prev => {
                const updated = { ...prev };
                const currentSecond = currentSecondRef.current;
                if (!updated[currentSecond]) {
                    updated[currentSecond] = { drawings: [], comment: '' };
                }
                updated[currentSecond] = {
                    ...updated[currentSecond],
                    drawings: updated[currentSecond].drawings || [],
                    comment: comment,
                };
                return updated;
            });
        }
        currentSecondRef.current = second;
        forceUpdate(n => n + 1);
        if (videoRef.current) {
            videoRef.current.setStatusAsync({
                positionMillis: second * 1000,
                shouldPlay: false
            });
        }
        if (isCoach) {
            setHasSavedFrames(true);
        }
    };

    // Handle student viewing annotations
    const handleStudentViewAnnotations = async () => {
        if (videoRef.current) {
            try {
                const status = await videoRef.current.getStatusAsync();
                const currentPos = Math.floor(status.positionMillis / 1000);
                currentSecondRef.current = currentPos;
                forceUpdate(n => n + 1);
                await videoRef.current.setStatusAsync({ shouldPlay: false });
                setStudentViewingAnnotations(true);
                setShowAnnotationOverlay(true);
            } catch (error) {
                console.error("Failed to get video position:", error);
                setStudentViewingAnnotations(true);
                setShowAnnotationOverlay(true);
            }
        }
    };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
    if (!video) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 40 }}>Video not found.</Text>;

    return (
        <View style={styles.container}>
            <CustomHeader
                title={isCoach ? "Coach Preview" : "Student Preview"}
                onBackPress={() => router.back()}
                showBackButton={true}
                defaultRoute={isCoach ? "/coach" : "/student"}
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
                        onPlaybackStatusUpdate={handleVideoProgress}
                    />

                    {/* Coach Controls */}
                    {isCoach && (
                        showAnnotationOverlay ? (
                            <TouchableOpacity
                                style={[
                                    styles.annotateBtn,
                                    { backgroundColor: '#4CAF50', zIndex: 300 }
                                ]}
                                onPress={() => {
                                    // Save current frame first
                                    setAnnotations(prev => {
                                        const updated = { ...prev };
                                        const sec = currentSecondRef.current;
                                        if (!updated[sec]) {
                                            updated[sec] = { drawings: [], comment: '' };
                                        }
                                        updated[sec] = {
                                            ...updated[sec],
                                            drawings: updated[sec]?.drawings || [],
                                            comment: comment,
                                        };
                                        return updated;
                                    });
                                    // Then save all annotations
                                    if (onSaveFinal) onSaveFinal(annotations);
                                    setShowAnnotationOverlay(false);
                                    setHasSavedFrames(false);
                                    Alert.alert("Success", "All annotations saved successfully!");
                                }}
                            >
                                <Text style={styles.annotateBtnText}>Save Annotation</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.annotateBtn, { zIndex: 300 }]}
                                onPress={async () => {
                                    if (videoRef.current) {
                                        try {
                                            const status = await videoRef.current.getStatusAsync();
                                            const currentPos = Math.floor(status.positionMillis / 1000);
                                            currentSecondRef.current = currentPos;
                                            forceUpdate(n => n + 1);
                                            await videoRef.current.setStatusAsync({ shouldPlay: false });
                                            setShowAnnotationOverlay(true);
                                        } catch (error) {
                                            console.error("Failed to get video position:", error);
                                            setShowAnnotationOverlay(true);
                                        }
                                    }
                                }}
                            >
                                <Text style={styles.annotateBtnText}>Annotate</Text>
                            </TouchableOpacity>
                        )
                    )}

                    {/* Student View Annotations Button */}
                    {!isCoach && hasAnnotations && !showAnnotationOverlay && (
                        <TouchableOpacity
                            style={[styles.viewAnnotationsBtn, { zIndex: 300 }]}
                            onPress={handleStudentViewAnnotations}
                        >
                            <Text style={styles.viewAnnotationsBtnText}>View Annotations</Text>
                        </TouchableOpacity>
                    )}

                    {/* Student Exit Annotation View Button */}
                    {!isCoach && showAnnotationOverlay && (
                        <TouchableOpacity
                            style={[styles.annotateBtn, { backgroundColor: '#FF6B6B', zIndex: 300 }]}
                            onPress={() => {
                                setShowAnnotationOverlay(false);
                                setStudentViewingAnnotations(false);
                            }}
                        >
                            <Text style={styles.annotateBtnText}>Exit Annotations</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.exitFullscreenBtn, { zIndex: 300 }]}
                        onPress={() => {
                            setCustomFullscreen(false);
                            setShowAnnotationOverlay(false);
                            setStudentViewingAnnotations(false);
                        }}
                    >
                        <Text style={styles.exitFullscreenText}>Exit Fullscreen</Text>
                    </TouchableOpacity>

                    {/* FIXED: Proper annotation overlay with correct positioning */}
                    {showAnnotationOverlay && (
                        <View style={styles.annotationOverlayContainer}>
                            {/* Frame Navigation - Fixed positioning */}
                            <View style={styles.frameNavigationContainer}>
                                <Text style={styles.frameInfo}>
                                    Frame {currentSecondRef.current + 1} of {Math.min(totalSeconds, 5)} ({currentSecondRef.current + 1}s)
                                </Text>
                                <FrameNavigation
                                    totalFrames={totalSeconds}
                                    currentFrame={currentSecondRef.current}
                                    onFrameChange={handleFrameChange}
                                    annotatedFrames={Object.entries(annotations)
                                        .filter(
                                            ([, frame]) =>
                                                frame && (
                                                    (Array.isArray(frame.drawings) && frame.drawings.length > 0) ||
                                                    !!frame.comment
                                                )
                                        )
                                        .map(([second]) => Number(second))
                                    }
                                />
                            </View>

                            {/* Video Content Area - This matches the video dimensions exactly */}
                            <View style={styles.videoContentArea}>
                                {/* Annotation Canvas - positioned to match video */}
                                {isCoach && (
                                    <AnnotationCanvas
                                        ref={annotationCanvasRef} // ✅ now added
                                        frame={currentSecondRef.current}
                                        frameData={annotations[currentSecondRef.current] || { drawings: [] }}
                                        onChange={(newFrameData) => handleAnnotationChange(currentSecondRef.current, newFrameData)}
                                        selectedTool={selectedToolRef.current}
                                        selectedColor={selectedColorRef.current}
                                        selectedThickness={selectedThicknessRef.current}
                                        style={styles.annotationCanvas}
                                        readOnly={false}
                                    />

                                )}

                                {/* Display existing annotations for students */}
                                {!isCoach && annotations[currentSecondRef.current] &&
                                    annotations[currentSecondRef.current].drawings &&
                                    annotations[currentSecondRef.current].drawings.length > 0 && (
                                        <AnnotationCanvas
                                            frame={currentSecondRef.current}
                                            frameData={annotations[currentSecondRef.current] || { drawings: [] }}
                                            selectedTool={selectedToolRef.current}
                                            selectedColor={selectedColorRef.current}
                                            selectedThickness={selectedThicknessRef.current}
                                            readOnly={true}
                                            style={styles.annotationCanvas}
                                        />
                                    )}

                                {/* Show message if no annotations for current frame */}
                                {!isCoach && !annotations[currentSecondRef.current] && (
                                    <View style={styles.noAnnotationContainer}>
                                        <Text style={styles.noAnnotationText}>
                                            No annotations for this frame
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Comments - Fixed positioning at bottom */}
                            {annotations[currentSecondRef.current] && annotations[currentSecondRef.current].comment && (
                                <View style={styles.commentDisplayContainer}>
                                    <Text style={styles.commentLabel}>Coach Comment:</Text>
                                    <Text style={styles.commentText}>
                                        {annotations[currentSecondRef.current].comment}
                                    </Text>
                                </View>
                            )}

                            {/* Coach-only annotation toolbar - Fixed positioning */}
                            {isCoach && (
                                <>
                                    <View style={styles.toolbarContainer}>
                                        <AnnotationToolbar
                                            selectedTool={selectedToolRef.current}
                                            onSelectTool={setSelectedTool}
                                            selectedColor={selectedColorRef.current}
                                            onSelectColor={setSelectedColor}
                                            selectedThickness={selectedThicknessRef.current}
                                            onSelectThickness={setSelectedThickness}
                                            onAddComment={() => setShowCommentModal(true)}
                                            onDeleteAll={handleDeleteAll}
                                            onExit={() => {
                                                if (hasSavedFrames) {
                                                    Alert.alert(
                                                        "Exit Annotation Mode?",
                                                        "You have annotations that will be saved when you click Save All Annotations.",
                                                        [
                                                            { text: "Stay in Annotation Mode", style: "cancel" },
                                                            { text: "Exit", onPress: () => setShowAnnotationOverlay(false) }
                                                        ]
                                                    );
                                                } else {
                                                    setShowAnnotationOverlay(false);
                                                }
                                            }}
                                            onUndo={() => annotationCanvasRef.current?.undoLastDrawing()}
                                        />
                                    </View>

                                    <CommentInputModal
                                        visible={showCommentModal}
                                        initialText={comment}
                                        onSave={(text) => {
                                            setComment(text);
                                            setAnnotations((prev) => {
                                                const updated = { ...prev };
                                                const currentSecond = currentSecondRef.current;
                                                if (!updated[currentSecond]) {
                                                    updated[currentSecond] = { drawings: [], comment: '' };
                                                }
                                                updated[currentSecond].comment = text;
                                                return updated;
                                            });
                                            setShowCommentModal(false);
                                        }}
                                        onCancel={() => setShowCommentModal(false)}
                                    />
                                </>
                            )}
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

                    {/* Enhanced Student UI */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity
                            style={styles.fullscreenBtn}
                            onPress={() => setCustomFullscreen(true)}
                        >
                            <Text style={styles.fullscreenBtnText}>Fullscreen</Text>
                        </TouchableOpacity>

                        {/* Show View Annotations button for students when annotations exist */}
                        {!isCoach && hasAnnotations && (
                            <TouchableOpacity
                                style={styles.viewAnnotationsBtnSmall}
                                onPress={() => {
                                    setCustomFullscreen(true);
                                    setTimeout(() => handleStudentViewAnnotations(), 100);
                                }}
                            >
                                <Text style={styles.viewAnnotationsBtnText}>View Annotations</Text>
                            </TouchableOpacity>
                        )}

                        {/* Show status for students */}
                        {!isCoach && (
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusText}>
                                    {hasAnnotations ? "✓ Coach annotations available" : "No annotations yet"}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.videoTitle}>Student: {video?.studentName}</Text>
                    <Text style={styles.videoId}>{video?.title || video?.fileName}</Text>
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
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
        paddingHorizontal: 16,
        flexWrap: 'wrap',
        gap: 12,
    },
    annotateBtn: {
        position: 'absolute',
        top: 36,
        right: 28,
        backgroundColor: '#1976d2',
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
    annotateBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    viewAnnotationsBtn: {
        position: 'absolute',
        top: 36,
        right: 28,
        backgroundColor: '#9C27B0',
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
    viewAnnotationsBtnSmall: {
        backgroundColor: '#9C27B0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 3,
    },
    viewAnnotationsBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    statusContainer: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
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
    fullscreenBtn: {
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
    // FIXED: New annotation overlay structure
    annotationOverlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    frameNavigationContainer: {
        position: 'absolute',
        top: 80,
        left: 16,
        right: 16,
        zIndex: 250,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        padding: 12,
    },
    frameInfo: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    // FIXED: Video content area that matches video dimensions
    videoContentArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 210,
        justifyContent: 'center',
        alignItems: 'center',
    },
    annotationCanvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 220,
    },
    commentDisplayContainer: {
        position: 'absolute',
        bottom: 80,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 12,
        padding: 16,
        zIndex: 250,
    },
    commentLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    commentText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 22,
    },
    noAnnotationContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 220,
    },
    noAnnotationText: {
        fontSize: 16,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
    toolbarContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 250,
        paddingHorizontal: 20,
    },
});