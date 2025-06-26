import React, { useRef, useState, useEffect } from 'react';
import { View, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnnotationCanvas = ({
  frameData = { drawings: [] },
  onChange,
  selectedTool = 'freehand',
  selectedColor = '#FF0000',
  selectedThickness = 4,
}) => {
  const [drawing, setDrawing] = useState(null);
  const drawingRef = useRef(drawing);

  // Keep ref in sync with state
  useEffect(() => {
    drawingRef.current = drawing;
  }, [drawing]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => selectedTool === 'freehand',
      onPanResponderGrant: (evt) => {
        if (selectedTool === 'freehand') {
          const { locationX, locationY } = evt.nativeEvent;
          const newDrawing = {
            color: selectedColor,
            thickness: selectedThickness,
            points: [{ x: locationX, y: locationY }],
          };
          setDrawing(newDrawing);
          drawingRef.current = newDrawing;
        }
      },
      onPanResponderMove: (evt) => {
        if (selectedTool === 'freehand' && drawingRef.current) {
          const { locationX, locationY } = evt.nativeEvent;
          const updated = {
            ...drawingRef.current,
            points: [...drawingRef.current.points, { x: locationX, y: locationY }],
          };
          setDrawing(updated);
          drawingRef.current = updated;
        }
      },
      onPanResponderRelease: () => {
        if (drawingRef.current) {
          // Save the drawing to parent
          onChange({
            ...frameData,
            drawings: [...(frameData.drawings || []), drawingRef.current],
          });
          setDrawing(null);
          drawingRef.current = null;
        }
      },
    })
  ).current;

  // Helper to convert points to SVG path
  const pointsToPath = (points) =>
    points && points.length
      ? `M${points.map((p) => `${p.x},${p.y}`).join(' L')}`
      : '';

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 1000,
      }}
      {...panResponder.panHandlers}
    >
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Render saved drawings */}
        {(frameData.drawings || []).map((d, i) => (
          <Path
            key={i}
            d={pointsToPath(d.points)}
            stroke={d.color}
            strokeWidth={d.thickness}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {/* Render current drawing */}
        {drawing && (
          <Path
            d={pointsToPath(drawing.points)}
            stroke={drawing.color}
            strokeWidth={drawing.thickness}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </Svg>
    </View>
  );
};

export default AnnotationCanvas;