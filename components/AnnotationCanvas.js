import React, {
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import { View, PanResponder, Dimensions } from 'react-native';
import Svg, { Path, Rect, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnnotationCanvas = forwardRef(
    (
        {
            frame,
            frameData = { drawings: [] },
            onChange,
            selectedTool = 'freehand',
            selectedColor = '#FF0000',
            selectedThickness = 4,
            readOnly = false,
        },
        ref
    ) => {
        /* using refs avoids frequent re-renders for in-progress drawings */
        const drawingRef = useRef(null);
        const currentShapeRef = useRef(null);

        /* monotonically increasing counter → provides z order */
        const zCounterRef = useRef(0);

        /* local state only used to force a manual re-render */
        const [, forceUpdate] = useState(0);

        /* reset drawing state whenever the video frame changes */
        useEffect(() => {
            drawingRef.current = null;
            currentShapeRef.current = null;
        }, [frame]);

        /* helper: render freehand stroke as many small line segments */
        const renderFreehand = (points, keyPrefix) => {
            if (!points || points.length < 2) return null;
            return points.slice(1).map((pt, i) => (
                <Path
                    key={`${keyPrefix}-${i}`}
                    d={`M${points[i].x},${points[i].y} L${pt.x},${pt.y}`}
                    stroke={pt.color}
                    strokeWidth={pt.thickness}
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            ));
        };

        /* expose undo to parent component */
        useImperativeHandle(ref, () => ({
            undoLastDrawing: () => {
                console.log('Undo called'); // 👈 check if this prints
                if (frameData?.drawings?.length) {
                    console.log('Current drawings');
                    onChange({
                        drawings: frameData.drawings.slice(0, -1),
                    });
                }
            }

        }));

        /* create a fresh PanResponder whenever style/tool settings change */
        const panResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => !readOnly && !!selectedTool,

                    onPanResponderGrant: (evt) => {
                        if (readOnly) return;
                        const { locationX, locationY } = evt.nativeEvent;

                        if (selectedTool === 'freehand') {
                            drawingRef.current = {
                                type: 'freehand',
                                points: [
                                    {
                                        x: locationX,
                                        y: locationY,
                                        color: selectedColor,
                                        thickness: selectedThickness,
                                    },
                                ],
                            };
                        } else if (
                            ['line', 'rectangle', 'circle'].includes(selectedTool)
                        ) {
                            // store shape start + default end = start
                            currentShapeRef.current = {
                                type: selectedTool,
                                start: { x: locationX, y: locationY },
                                end: { x: locationX, y: locationY },
                                color: selectedColor,
                                thickness: selectedThickness,
                            };
                        }
                        forceUpdate((n) => n + 1);
                    },

                    onPanResponderMove: (evt) => {
                        if (readOnly) return;
                        const { locationX, locationY } = evt.nativeEvent;

                        if (selectedTool === 'freehand' && drawingRef.current) {
                            /* inline comment: push each point for freehand */
                            drawingRef.current.points.push({
                                x: locationX,
                                y: locationY,
                                color: selectedColor,
                                thickness: selectedThickness,
                            });
                        } else if (currentShapeRef.current) {
                            currentShapeRef.current.end = { x: locationX, y: locationY };
                        }
                        forceUpdate((n) => n + 1);
                    },

                    onPanResponderRelease: () => {
                        if (readOnly) return;
                        const newDrawing = drawingRef.current || currentShapeRef.current;
                        if (newDrawing) {
                            // assign unique z before saving
                            const drawingWithZ = {
                                ...newDrawing,
                                z: zCounterRef.current++,
                            };

                            onChange({
                                drawings: [
                                    ...(frameData?.drawings || []),
                                    drawingWithZ, // newest at the end
                                ],
                            });
                        }
                        drawingRef.current = null;
                        currentShapeRef.current = null;
                        forceUpdate((n) => n + 1);
                    },
                }),
            [selectedTool, selectedColor, selectedThickness, readOnly, frameData]
        );

        /* main render */
        return (
            <View style={{ width, height }} {...panResponder.panHandlers}>
                <Svg
                    width={width}
                    height={height}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                >
                    {/* render saved drawings sorted by z (oldest → newest) */}
                    {(frameData?.drawings || [])
                        .slice()
                        .sort((a, b) => a.z - b.z)
                        .map((d, i) => {
                            if (d.type === 'freehand') {
                                return renderFreehand(d.points, `saved-${i}`);
                            }
                            if (d.type === 'line' && d.start && d.end) {
                                return (
                                    <Path
                                        key={i}
                                        d={`M${d.start.x},${d.start.y} L${d.end.x},${d.end.y}`}
                                        stroke={d.color}
                                        strokeWidth={d.thickness}
                                        fill="none"
                                    />
                                );
                            }
                            if (d.type === 'rectangle' && d.start && d.end) {
                                const x = Math.min(d.start.x, d.end.x);
                                const y = Math.min(d.start.y, d.end.y);
                                const w = Math.abs(d.start.x - d.end.x);
                                const h = Math.abs(d.start.y - d.end.y);
                                return (
                                    <Rect
                                        key={i}
                                        x={x}
                                        y={y}
                                        width={w}
                                        height={h}
                                        stroke={d.color}
                                        strokeWidth={d.thickness}
                                        fill="none"
                                    />
                                );
                            }
                            if (d.type === 'circle' && d.start && d.end) {
                                const cx = (d.start.x + d.end.x) / 2;
                                const cy = (d.start.y + d.end.y) / 2;
                                const rx = Math.abs(d.start.x - d.end.x) / 2;
                                const ry = Math.abs(d.start.y - d.end.y) / 2;
                                return (
                                    <Ellipse
                                        key={i}
                                        cx={cx}
                                        cy={cy}
                                        rx={rx}
                                        ry={ry}
                                        stroke={d.color}
                                        strokeWidth={d.thickness}
                                        fill="none"
                                    />
                                );
                            }
                            return null;
                        })}

                    {/* in-progress freehand */}
                    {drawingRef.current &&
                        drawingRef.current.points &&
                        renderFreehand(drawingRef.current.points, 'current-free')}

                    {/* in-progress shapes */}
                    {currentShapeRef.current &&
                        currentShapeRef.current.type === 'line' && (
                            <Path
                                d={`M${currentShapeRef.current.start.x},${currentShapeRef.current.start.y} L${currentShapeRef.current.end.x},${currentShapeRef.current.end.y}`}
                                stroke={currentShapeRef.current.color}
                                strokeWidth={currentShapeRef.current.thickness}
                                fill="none"
                            />
                        )}

                    {currentShapeRef.current &&
                        currentShapeRef.current.type === 'rectangle' &&
                        (() => {
                            const x = Math.min(
                                currentShapeRef.current.start.x,
                                currentShapeRef.current.end.x
                            );
                            const y = Math.min(
                                currentShapeRef.current.start.y,
                                currentShapeRef.current.end.y
                            );
                            const w = Math.abs(
                                currentShapeRef.current.start.x - currentShapeRef.current.end.x
                            );
                            const h = Math.abs(
                                currentShapeRef.current.start.y - currentShapeRef.current.end.y
                            );
                            return (
                                <Rect
                                    x={x}
                                    y={y}
                                    width={w}
                                    height={h}
                                    stroke={currentShapeRef.current.color}
                                    strokeWidth={currentShapeRef.current.thickness}
                                    fill="none"
                                />
                            );
                        })()}

                    {currentShapeRef.current &&
                        currentShapeRef.current.type === 'circle' &&
                        (() => {
                            const cx =
                                (currentShapeRef.current.start.x +
                                    currentShapeRef.current.end.x) /
                                2;
                            const cy =
                                (currentShapeRef.current.start.y +
                                    currentShapeRef.current.end.y) /
                                2;
                            const rx = Math.abs(
                                currentShapeRef.current.start.x -
                                currentShapeRef.current.end.x
                            ) / 2;
                            const ry = Math.abs(
                                currentShapeRef.current.start.y -
                                currentShapeRef.current.end.y
                            ) / 2;
                            return (
                                <Ellipse
                                    cx={cx}
                                    cy={cy}
                                    rx={rx}
                                    ry={ry}
                                    stroke={currentShapeRef.current.color}
                                    strokeWidth={currentShapeRef.current.thickness}
                                    fill="none"
                                />
                            );
                        })()}
                </Svg>
            </View>
        );
    }
);

export default AnnotationCanvas;