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

export default function VideoPreviewSection({ videoId, onAnnotate, annotations, setAnnotations, onSaveFinal }) {
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
    const [hasSavedFrames, setHasSavedFrames] = useState(false);

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
      const checkIfCoach = async () => {
        try {
          const token = await getToken();
          if (token) {
            const user = jwtDecode(token);
            setIsCoach(user.role === 'coach');
          }
        } catch (error) {
          console.error('Error checking coach status:', error);
        }
      };
      
      checkIfCoach();
    }, []);

    const handleVideoLoad = (status) => {
        const duration = status.durationMillis / 1000;
        setTotalSeconds(Math.ceil(duration));
    };

    // FIX: Load comment after currentSecond updates
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setStatusAsync({ positionMillis: currentSecond * 1000, shouldPlay: false });
        }
        
        // Load comment for current frame
        const frameData = annotations[currentSecond];
        if (frameData) {
            setComment(frameData.comment || '');
        } else {
            setComment('');
        }
    }, [currentSecond, annotations]);

    // Save current frame annotation
    const handleSave = () => {
        setAnnotations(prev => {
            const updated = [...prev];
            updated[currentSecond] = {
                ...updated[currentSecond],
                drawings: updated[currentSecond]?.drawings || [],
                comment: comment,
            };
            return updated;
        });
        
        setHasSavedFrames(true);
    };

    // FIX: Correctly handle annotation changes
    const handleAnnotationChange = (second, newFrameData) => {
        setAnnotations(prev => {
            const updated = [...prev];
            
            // Make sure there's an object for this second
            if (!updated[second]) {
                updated[second] = { drawings: [], comment: '' };
            }
            
            // Update with new data
            updated[second] = {
                ...updated[second],
                ...newFrameData,
                comment: comment,
            };
            
            return updated;
        });
        
        setHasSavedFrames(true);
    };

    const handleSelectTool = (tool) => {
        if (tool === 'freehand') setSelectedTool(tool);
    };

    // Show annotations to students during playback
    const handleVideoProgress = (playbackStatus) => {
        if (!isCoach && playbackStatus.isPlaying) {
            const currentPos = Math.floor(playbackStatus.positionMillis / 1000);
            const hasAnnotation = annotations[currentPos] && 
                (annotations[currentPos].drawings?.length > 0 || annotations[currentPos].comment);
                
            if (hasAnnotation) {
                videoRef.current.pauseAsync();
                setCurrentSecond(currentPos);
                setShowAnnotationOverlay(true);
            }
        }
    };

    // FIX: Frame navigation function
    const handleFrameChange = (second) => {
        // First save current frame
        const updatedAnnotations = [...annotations];
        
        // Make sure we have an object for the current second
        if (!updatedAnnotations[currentSecond]) {
            updatedAnnotations[currentSecond] = { drawings: [], comment: '' };
        }
        
        // Update the current frame's data
        updatedAnnotations[currentSecond] = {
            ...updatedAnnotations[currentSecond],
            drawings: updatedAnnotations[currentSecond].drawings || [],
            comment: comment,
        };
        
        // Update annotations state
        setAnnotations(updatedAnnotations);
        
        // Now it's safe to change seconds
        setCurrentSecond(second);
        
        // Update video position
        if (videoRef.current) {
            videoRef.current.setStatusAsync({ 
                positionMillis: second * 1000, 
                shouldPlay: false 
            });
        }
        
        setHasSavedFrames(true);
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
                        onPlaybackStatusUpdate={handleVideoProgress}
                    />
                    
                    {isCoach && (
                        showAnnotationOverlay ? (
                            <TouchableOpacity 
                                style={[
                                    styles.annotateBtn, 
                                    { backgroundColor: '#4CAF50', zIndex: 250 }
                                ]}
                                onPress={() => {
                                    // Save current frame first
                                    const updatedAnnotations = [...annotations];
                                    updatedAnnotations[currentSecond] = {
                                        ...updatedAnnotations[currentSecond],
                                        drawings: updatedAnnotations[currentSecond]?.drawings || [],
                                        comment: comment,
                                    };
                                    setAnnotations(updatedAnnotations);
                                    
                                    // Then save all annotations
                                    if (onSaveFinal) onSaveFinal(updatedAnnotations);
                                    setShowAnnotationOverlay(false);
                                    setHasSavedFrames(false);
                                    Alert.alert("Success", "All annotations saved successfully!");
                                }}
                            >
                                <Text style={styles.annotateBtnText}>Save All Annotations</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={styles.annotateBtn}
                                onPress={async () => {
                                    if (videoRef.current) {
                                        try {
                                            const status = await videoRef.current.getStatusAsync();
                                            const currentPos = Math.floor(status.positionMillis / 1000);
                                            setCurrentSecond(currentPos);
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
                    
                    <TouchableOpacity 
                        style={[styles.exitFullscreenBtn, { zIndex: 250 }]} 
                        onPress={() => {
                            setCustomFullscreen(false);
                            setShowAnnotationOverlay(false);
                        }}
                    >
                        <Text style={styles.exitFullscreenText}>Exit Fullscreen</Text>
                    </TouchableOpacity>
                    
                    {showAnnotationOverlay && (
                        <View 
                            style={[styles.annotationOverlay, { paddingTop: 80 }]}
                            pointerEvents="box-none"
                        >
                            <View style={styles.frameNavigationContainer}>
                                <Text style={styles.frameInfo}>
                                    Frame {currentSecond + 1} of {Math.min(totalSeconds, 5)} ({currentSecond + 1}s)
                                </Text>
                                
                                <FrameNavigation
                                    totalFrames={Math.min(totalSeconds, 5)}
                                    currentFrame={currentSecond}
                                    onFrameChange={handleFrameChange}
                                    annotatedFrames={annotations
                                        .map((frame, index) => 
                                            frame && (frame.drawings?.length > 0 || frame.comment) ? index : null)
                                        .filter(index => index !== null)}
                                />
                            </View>

                            <AnnotationCanvas
                                frame={currentSecond}
                                frameData={annotations[currentSecond] || { drawings: [] }}
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
                            />
                            
                            <CommentInputModal
                                visible={showCommentModal}
                                initialText={comment}
                                onSave={(text) => {
                                    setComment(text);
                                    setAnnotations((prev) => {
                                        const updated = [...prev];
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
            <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/nextPage')}>
                <Text style={styles.continueBtnText}>NIGGESH</Text>
            </TouchableOpacity>
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
        paddingTop: 80,
        width: '100%',
        height: '100%',
    },
    frameNavigationContainer: {
      position: 'absolute',
      top: 80,
      width: '100%',
      paddingHorizontal: 16,
      zIndex: 210,
    },
    frameInfo: {
      fontSize: 14,
      color: '#fff',
      marginBottom: 8,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    continueBtn: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    continueBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});