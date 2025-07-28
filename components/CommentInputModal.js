import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CommentInputModal = ({ visible, onSave, onCancel, initialText = '' }) => {
    const [text, setText] = useState(initialText);

    // Reset text when modal is opened or initialText changes
    useEffect(() => {
        if (visible) {
            setText(initialText);
        }
    }, [visible, initialText]);

    const handleSave = () => {
        if (text.trim()) {
            onSave(text);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.label}>Add Comment</Text>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder="Enter your comment"
                        multiline
                    />
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btn} onPress={handleSave}>
                            <Text style={styles.btnText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={handleCancel}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 8,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 16,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        minHeight: 60,
        marginBottom: 16,
        fontSize: 15,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    btn: {
        marginLeft: 10,
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: '#007bff',
        borderRadius: 6,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CommentInputModal;