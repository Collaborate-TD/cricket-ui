import React, { useState, useRef } from 'react';
import { View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput } from 'react-native';
import { Video } from 'expo-av';
import AnnotationToolbar from './AnnotationToolbar';
import AnnotationCanvas from './AnnotationCanvas';
import FrameNavigation from './FrameNavigation';
import AnnotationExitWarningModal from './AnnotationExitWarningModal';
import CommentInputModal from './CommentInputModal';

const { width, height } = Dimensions.get('window');

const VideoPlayerWithAnnotations = ({ videoUri, annotations, setAnnotations, onSave, onExit }) => {
  const [isAnnotating, setIsAnnotating] = useState(true); // Always annotating in fullscreen
  const [currentSecond, setCurrentSecond] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(1);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Tool state
  const [selectedTool, setSelectedTool] = useState('freehand');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedThickness, setSelectedThickness] = useState(4);
  const [comment, setComment] = useState('');

  const videoRef = useRef(null);

  // Get video duration in seconds
  const handleVideoLoad = (status) => {
    const duration = status.durationMillis / 1000;
    setTotalSeconds(Math.ceil(duration));
  };

  // Seek video when currentSecond changes
  React.useEffect(() => {
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
    setHasUnsavedChanges(false);
    if (onSave) onSave();
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
    setHasUnsavedChanges(true);
  };

  // Handle exit
  const handleExit = () => {
    if (hasUnsavedChanges) setShowExitWarning(true);
    else if (onExit) onExit();
  };

  // Only freehand tool enabled
  const handleSelectTool = (tool) => {
    if (tool === 'freehand') setSelectedTool(tool);
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
      <FrameNavigation
        totalFrames={totalSeconds}
        currentFrame={currentSecond}
        onFrameChange={setCurrentSecond}
        annotatedFrames={annotations.map((a, i) => a && i).filter(Boolean)}
      />
      <View style={styles.annotationOverlay}>
        <AnnotationCanvas
          frame={currentSecond}
          frameData={annotations[currentSecond]}
          onChange={(newFrameData) => handleAnnotationChange(currentSecond, newFrameData)}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          selectedThickness={selectedThickness}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
        style={styles.toolsContainer}
      >
        <AnnotationToolbar
          selectedTool={selectedTool}
          onSelectTool={handleSelectTool}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          selectedThickness={selectedThickness}
          onSelectThickness={setSelectedThickness}
          onUndo={() => {}} // implement if needed
          onRedo={() => {}} // implement if needed
          onAddComment={() => setShowCommentModal(true)}
          onSave={handleSave}
          onExit={handleExit}
        />
      </KeyboardAvoidingView>
      <AnnotationExitWarningModal
        visible={showExitWarning}
        onConfirm={() => {
          setShowExitWarning(false);
          if (onExit) onExit();
        }}
        onCancel={() => setShowExitWarning(false)}
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
          setHasUnsavedChanges(true);
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
  annotationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.45,
    zIndex: 10,
  },
  toolsContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#fff',
    zIndex: 20,
    paddingBottom: 10,
  },
  commentBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    elevation: 4,
  },
  commentLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    minHeight: 60,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  commentBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  commentBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VideoPlayerWithAnnotations;