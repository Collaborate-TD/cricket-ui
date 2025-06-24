import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePhoto } from '../services/api';
import { showAlert } from '../utils/alertMessage';

const ProfilePhotoUploader = ({ photoUri, setPhoto, defaultImage = require('../assets/default-user.png') }) => {
  const [uploading, setUploading] = useState(false);

  const requestPermission = async () => {
    //console.log('Requesting media library permission'); // Debug
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      //console.error('Permission denied for media library'); // Debug
      showAlert('Permission Denied', 'Please allow access to your photo library.');
      return false;
    }
    //console.log('Permission granted for media library'); // Debug
    return true;
  };

  const pickImage = async () => {
    try {
      //console.log('Initiating image picker'); // Debug
      if (!(await requestPermission())) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      //console.log('Image picker result:', result); // Debug
      if (!result.canceled) {
        setUploading(true);
        const photo = result.assets[0];
        const fileName = await uploadProfilePhoto(photo);
        if (fileName) {
          setPhoto({ ...photo, fileName });
          //console.log('Photo uploaded:', fileName); // Debug
        } else {
          showAlert('Error', 'Failed to upload photo');
        }
      } else {
        //console.log('Image selection canceled'); // Debug
      }
    } catch (err) {
      //console.error('Image picker or upload error:', err.message); // Debug
      showAlert('Error', 'Failed to select or upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {uploading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : (
          <Image
            source={photoUri ? { uri: photoUri } : defaultImage}
            style={styles.image}
          />
        )}
      </TouchableOpacity>
      <Text style={styles.label}>Tap to select profile photo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 20 },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  label: { fontSize: 14, color: '#1976d2', marginTop: 8 },
});

export default ProfilePhotoUploader;