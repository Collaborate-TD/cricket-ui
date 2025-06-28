import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const StaticAnnotationDisplay = ({ drawings, comment }) => {
    return (
        <View style={styles.container}>
            {/* Display drawings */}
            <Svg style={styles.svgCanvas}>
                {drawings.map((drawing, index) => (
                    <Path
                        key={index}
                        d={drawing.path}
                        stroke={drawing.color || '#FF0000'}
                        strokeWidth={drawing.thickness || 4}
                        fill="none"
                    />
                ))}
            </Svg>
            
            {/* Display comment */}
            {comment ? (
                <View style={styles.commentContainer}>
                    <Text style={styles.commentLabel}>Coach's Comment:</Text>
                    <Text style={styles.commentText}>{comment}</Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    svgCanvas: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    commentContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 8,
    },
    commentLabel: {
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    commentText: {
        color: '#FFF',
    },
});

export default StaticAnnotationDisplay;