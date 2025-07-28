import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AnnotationExitWarningModal = ({ visible, onConfirm, onCancel }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Unsaved Changes</Text>
        <Text style={styles.message}>
          You have unsaved annotations. Are you sure you want to exit? All unsaved changes will be lost.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={onCancel}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.exitBtn]} onPress={onConfirm}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Exit Anyway</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    elevation: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#d32f2f',
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  exitBtn: {
    backgroundColor: '#d32f2f',
  },
  btnText: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
});

export default AnnotationExitWarningModal;