import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnnotationCanvas = forwardRef(({
    frame, // Add frame prop to track which frame is being edited
    frameData = { drawings: [] },
    onChange,
    selectedTool = 'freehand',
    selectedColor = '#FF0000',
    selectedThickness = 4,
    readOnly = false,
}, ref) => {
    const [drawing, setDrawing] = useState(null);
    const drawingRef = useRef(drawing);

    // Keep ref in sync with state
    useEffect(() => {
        drawingRef.current = drawing;
    }, [drawing]);

    // Update drawing properties when tool settings change
    useEffect(() => {
        if (drawing) {
            setDrawing((prev) => ({
                ...prev,
                color: selectedColor,
                thickness: selectedThickness,
            }));
        }
    }, [selectedColor, selectedThickness]);
    // Reset drawing state when frame changes
    useEffect(() => {
        setDrawing(null);
    }, [frame]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !readOnly && selectedTool === 'freehand',
            onPanResponderGrant: (evt) => {
                if (readOnly) return;
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
                if (readOnly) return;
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
                if (readOnly) return;
                if (drawingRef.current) {
                    // Save the drawing to parent component
                    const currentDrawings = frameData?.drawings || [];
                    onChange({
                        drawings: [drawingRef.current],
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

    // Expose the undoLastDrawing method to parent
    useImperativeHandle(ref, () => ({
        undoLastDrawing: () => {
            if (frameData?.drawings && frameData.drawings.length > 0) {
                onChange({
                    drawings: frameData.drawings.slice(0, -1),
                });
            }
        }
    }));

    return (
        <View
            style={{
                width,
                height,
            }}
            {...panResponder.panHandlers}
        >
            <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Render saved drawings */}
                {(frameData?.drawings || []).map((d, i) => (
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
});

export default AnnotationCanvas;