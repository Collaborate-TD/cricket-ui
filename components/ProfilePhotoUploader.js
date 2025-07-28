import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../utils/alertMessage';

const ProfilePhotoUploader = ({ photoUri, setPhoto, defaultImage = require('../assets/default-user.png'), uploading }) => {
    const [localUploading, setLocalUploading] = useState(false);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('Permission Denied', 'Please allow access to your photo library.');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        try {
            if (!(await requestPermission())) return;
            setLocalUploading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            if (!result.canceled) {
                const photo = result.assets[0];
                setPhoto(photo); // Only pass the photo object up, do not upload here!
            }
        } catch (err) {
            showAlert('Error', 'Failed to select photo');
        } finally {
            setLocalUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {uploading || localUploading ? (
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