import { Platform, Alert } from 'react-native';

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

/**
 * Utility function to show a confirm dialog.
 * @param {string} title
 * @param {string} message
 * @param {function} onConfirm
 * @param {function} onCancel
 */
export const showConfirm = (title, message, onConfirm, onCancel) => {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n${message}`)) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
        }
    } else {
        Alert.alert(
            title,
            message,
            [
                { text: 'Cancel', style: 'cancel', onPress: onCancel },
                { text: 'Remove', style: 'destructive', onPress: onConfirm }
            ]
        );
    }
};