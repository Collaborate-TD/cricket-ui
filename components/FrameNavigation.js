import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const FrameNavigation = ({
  totalFrames,
  currentFrame,
  onFrameChange,
  annotatedFrames = [],
}) => {
  // Show a scrollable row of second indicators (dots)
  const frameDots = [];
  for (let i = 0; i < totalFrames; i++) {
    const isAnnotated = annotatedFrames.includes(i);
    frameDots.push(
      <TouchableOpacity
        key={i}
        style={[
          styles.dot,
          currentFrame === i && styles.currentDot,
          isAnnotated && styles.annotatedDot,
        ]}
        onPress={() => onFrameChange(i)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navBtn}
        onPress={() => onFrameChange(Math.max(0, currentFrame - 1))}
        disabled={currentFrame === 0}
      >
        <Text style={styles.navText}>Prev</Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dotsRow}
      >
        {frameDots}
      </ScrollView>
      <TouchableOpacity
        style={styles.navBtn}
        onPress={() => onFrameChange(Math.min(totalFrames - 1, currentFrame + 1))}
        disabled={currentFrame === totalFrames - 1}
      >
        <Text style={styles.navText}>Next</Text>
      </TouchableOpacity>
      <Text style={styles.frameLabel}>
        Second {currentFrame + 1} / {totalFrames}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
  },
  navBtn: {
    padding: 8,
    backgroundColor: '#ddeeff',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navText: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  currentDot: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  annotatedDot: {
    backgroundColor: '#ffeb3b',
  },
  frameLabel: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FrameNavigation;