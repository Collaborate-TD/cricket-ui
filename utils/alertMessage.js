import { Platform } from 'react-native';
import { Alert } from 'react-native';
/**
 * Utility function to show an alert message.
 * Works across web and native platforms.
 *
 * @param {string} title - The title of the alert.
 * @param {string} message - The message of the alert.
 */

export const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message} !!`);
    } else {
        Alert.alert(title, message);
    }
};