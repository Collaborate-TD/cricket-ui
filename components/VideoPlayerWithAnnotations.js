import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av';
import AnnotationCanvas from './AnnotationCanvas';
import AnnotationToolbar from './AnnotationToolbar';
import CommentInputModal from './CommentInputModal';
import FrameNavigation from './FrameNavigation';

const { width, height } = Dimensions.get('window');

const VideoPlayerWithAnnotations = ({ videoUri, annotations, setAnnotations, onSave, onExit }) => {
  const [currentSecond, setCurrentSecond] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(5); // Default to 5 seconds
  const [selectedTool, setSelectedTool] = useState('freehand');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedThickness, setSelectedThickness] = useState(4);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveAnnotationsLocally(videoUri, annotations);
      }, 10000); // Auto-save every 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, annotations, videoUri]);

  // Helper function to save annotations to AsyncStorage
  const saveAnnotationsLocally = async (videoKey, annotationData) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storageKey = `annotations_${videoKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify({
        timestamp: new Date().toISOString(),
        annotations: annotationData
      }));
      console.log('Annotations auto-saved');
    } catch (error) {
      console.error('Error auto-saving annotations:', error);
    }
  };

  // Get video duration in seconds
  const handleVideoLoad = (status) => {
    // Limit to 5 seconds for cricket video analysis
    const duration = Math.min(5, status.durationMillis / 1000);
    setTotalSeconds(Math.ceil(duration));
  };

  // Update comment when changing frames
  useEffect(() => {
    const frameData = annotations[currentSecond] || { drawings: [], comment: '' };
    setComment(frameData.comment || '');
  }, [currentSecond, annotations]);

  // Handle annotation change
  const handleAnnotationChange = (newFrameData) => {
    setAnnotations((prev) => {
      const updated = [...prev];
      updated[currentSecond] = {
        ...updated[currentSecond],
        ...newFrameData,
        comment: comment, // keep comment in sync
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Save current frame annotation
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
    
    Alert.alert(
      "Annotation Saved", 
      "Your annotation for this frame has been saved.",
      [
        {
          text: "Continue Watching",
          onPress: () => {
            if (videoRef.current) {
              videoRef.current.setStatusAsync({ shouldPlay: true });
            }
          }
        },
        { 
          text: "Stay Paused", 
          style: "cancel"
        }
      ]
    );
    
    setHasUnsavedChanges(false);
  };

  // Undo last drawing
  const handleUndo = () => {
    if (canvasRef.current && canvasRef.current.undoLastDrawing) {
      canvasRef.current.undoLastDrawing();
    }
  };

  // Exit with confirmation if there are unsaved changes
  const handleExit = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved annotations. Do you want to save before exiting?",
        [
          {
            text: "Save & Exit",
            onPress: () => {
              if (onSave) onSave(annotations);
              if (onExit) onExit();
            }
          },
          {
            text: "Exit Without Saving",
            style: "destructive",
            onPress: () => {
              if (onExit) onExit();
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } else {
      if (onExit) onExit();
    }
  };

  return (
    <View style={styles.fullscreenContainer}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.video}
        resizeMode="contain"
        shouldPlay={false}
        onLoad={handleVideoLoad}
      />
      
      {/* Frame navigation */}
      <View style={styles.frameNavigationContainer}>
        <Text style={styles.frameInfo}>
          Frame {currentSecond + 1} of {totalSeconds} ({currentSecond + 1}s)
        </Text>
        
        <FrameNavigation
          totalFrames={totalSeconds}
          currentFrame={currentSecond}
          onFrameChange={(second) => {
            // First, save current frame's annotations before switching
            setAnnotations(prev => {
              const updated = [...prev];
              updated[currentSecond] = {
                ...updated[currentSecond],
                drawings: updated[currentSecond]?.drawings || [],
                comment: comment, // Save current comment
              };
              return updated;
            });

            // Then update to the new frame
            setCurrentSecond(second);
            if (videoRef.current) {
              videoRef.current.setStatusAsync({ positionMillis: second * 1000, shouldPlay: false });
            }
          }}
          annotatedFrames={annotations
            .map((frame, index) => 
              frame && (frame.drawings?.length > 0 || frame.comment) ? index : null)
            .filter(index => index !== null)}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.saveAllBtn}
        onPress={() => {
          if (onSave) onSave(annotations);
          Alert.alert("Success", "All annotations saved successfully!");
        }}
      >
        <Text style={styles.saveAllBtnText}>Save All Annotations</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
        <Text style={styles.exitBtnText}>Exit</Text>
      </TouchableOpacity>
      
      <View
        style={styles.annotationOverlay}
        pointerEvents="box-none"
      >
        <View style={{ width: width, height: height * 0.45 }} pointerEvents="auto">
          <AnnotationCanvas
            frameData={annotations[currentSecond] || { drawings: [] }}
            onChange={handleAnnotationChange}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            selectedThickness={selectedThickness}
            ref={canvasRef}
          />
        </View>
        
        <AnnotationToolbar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          selectedThickness={selectedThickness}
          onSelectThickness={setSelectedThickness}
          onUndo={handleUndo}
          onAddComment={() => setShowCommentModal(true)}
          onSave={handleSave}
          style={styles.toolsContainer}
        />
        
        {/* Comment section */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Comment:</Text>
          <TouchableOpacity 
            style={styles.commentText} 
            onPress={() => setShowCommentModal(true)}
          >
            <Text style={comment ? styles.commentContent : styles.commentPlaceholder}>
              {comment || "Tap to add comment..."}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <CommentInputModal
        visible={showCommentModal}
        initialText={comment}
        onSave={(text) => {
          setComment(text);
          setShowCommentModal(false);
        }}
        onCancel={() => setShowCommentModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height * 0.45,
    backgroundColor: '#000',
  },
  frameNavigationContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  frameInfo: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  annotationOverlay: {
    flex: 1,
    width: '100%',
  },
  saveAllBtn: {
    position: 'absolute',
    top: 36,
    right: 28,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    zIndex: 10,
  },
  saveAllBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitBtn: {
    position: 'absolute',
    top: 36,
    left: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  exitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toolsContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#fff',
    zIndex: 20,
    paddingBottom: 10,
  },
  commentSection: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  commentLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  commentText: {
    color: '#fff',
    fontSize: 16,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  commentContent: {
    color: '#fff',
    fontSize: 16,
  },
  commentPlaceholder: {
    color: '#aaa',
    fontStyle: 'italic',
  },
});

export default VideoPlayerWithAnnotations;