import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TOOLS = [
  { type: 'freehand', label: '✏️' },
  // Only freehand for now
];

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#000000'];
const THICKNESSES = [2, 4, 6, 8];

const AnnotationToolbar = ({
  selectedTool,
  onSelectTool,
  selectedColor,
  onSelectColor,
  selectedThickness,
  onSelectThickness,
  onAddComment,
  onSave,
  onExit,
  canvasRef,
  onUndo,
}) => (
  <View style={styles.toolbar}>
    <View style={styles.row}>
      {TOOLS.map((tool) => (
        <TouchableOpacity
          key={tool.type}
          style={[
            styles.toolBtn,
            selectedTool === tool.type && styles.selectedBtn,
          ]}
          onPress={() => onSelectTool(tool.type)}
        >
          <Text>{tool.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.row}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorBtn,
            { backgroundColor: color },
            selectedColor === color && styles.selectedColor,
          ]}
          onPress={() => onSelectColor(color)}
        />
      ))}
    </View>
    <View style={styles.row}>
      {THICKNESSES.map((thickness) => (
        <TouchableOpacity
          key={thickness}
          style={[
            styles.thicknessBtn,
            selectedThickness === thickness && styles.selectedBtn,
          ]}
          onPress={() => onSelectThickness(thickness)}
        >
          <Text>{thickness}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <View style={styles.row}>
      <TouchableOpacity style={styles.actionBtn} onPress={onAddComment}>
        <Text>💬</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onSave}>
        <Text>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onExit}>
        <Text>Exit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onUndo}>
        <Text>Undo</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    margin: 8,
    elevation: 4,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtn: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  selectedBtn: {
    backgroundColor: '#cceeff',
  },
  colorBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  thicknessBtn: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  actionBtn: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#ddeeff',
  },
  annotationOverlay: {
    backgroundColor: 'rgba(0,0,0,0.10)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    flex: 1,
  },
});

export default AnnotationToolbar;