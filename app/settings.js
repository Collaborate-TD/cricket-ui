import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import CustomHeader from '../components/CustomHeader';
import { removeToken } from '../utils/tokenStorage';

export default function Settings() {
    const router = useRouter();
    const scheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    const handleOptionPress = (option) => {
        Alert.alert(option, `${option} screen not implemented yet.`);
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleSignOut = async () => {
        try {
            const response = await fetch('/api/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to sign out');
            }

            await removeToken();
            router.replace('/login');
        } catch (err) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centered}>
                <Text style={scheme === 'dark' ? styles.loadingTextDark : styles.loadingText}>
                    Loading...
                </Text>
            </View>
        );
    }

    const options = [
        {
            name: 'Profile Settings',
            icon: <Ionicons name="person-circle-outline" size={24} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />,
            onPress: () => handleOptionPress('Profile Settings'),
        },
        {
            name: 'Notification Preferences',
            icon: <Ionicons name="notifications-outline" size={24} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />,
            onPress: () => handleOptionPress('Notification Preferences'),
        },
        {
            name: 'Video Storage Settings',
            icon: <MaterialIcons name="video-library" size={24} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />,
            onPress: () => handleOptionPress('Video Storage'),
        },
        {
            name: 'Annotation Tool Preferences',
            icon: <Ionicons name="brush-outline" size={24} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />,
            onPress: () => handleOptionPress('Annotation Tools'),
        },
        {
            name: 'Feedback Template Customization',
            icon: <Ionicons name="document-text-outline" size={24} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />,
            onPress: () => handleOptionPress('Feedback Templates'),
        },
        {
            name: 'About the App',
            icon: <Ionicons name="information-circle-outline" size={24} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />,
            onPress: () => handleOptionPress('About'),
        },
    ];

    return (
        <View style={scheme === 'dark' ? styles.containerDark : styles.container}>
            <CustomHeader
                title="Settings"
                onBackPress={handleBackPress}
                showBackButton={true}
                defaultRoute="/student"
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={scheme === 'dark' ? styles.cardDark : styles.card}>
                    <Text style={scheme === 'dark' ? styles.sectionTitleDark : styles.sectionTitle}>
                        General Settings
                    </Text>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={scheme === 'dark' ? styles.optionDark : styles.option}
                            onPress={option.onPress}
                            activeOpacity={0.8}
                        >
                            <View style={styles.optionContent}>
                                {option.icon}
                                <Text style={scheme === 'dark' ? styles.optionTextDark : styles.optionText}>
                                    {option.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <LinearGradient
                    colors={scheme === 'dark' ? ['#d32f2f', '#b71c1c'] : ['#d32f2f', '#c62828']}
                    style={styles.logoutButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleSignOut}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb',
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#181c24',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f8fb',
    },
    centeredDark: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181c24',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins_400Regular',
    },
    loadingTextDark: {
        marginTop: 16,
        fontSize: 16,
        color: '#888',
        fontFamily: 'Poppins_400Regular',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 8,
        marginVertical: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: 'rgba(25, 118, 210, 0.10)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 10,
        elevation: 7,
    },
    cardDark: {
        backgroundColor: '#23243a',
        marginHorizontal: 8,
        marginVertical: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 10,
        elevation: 7,
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: '#222f3e',
        marginBottom: 20,
    },
    sectionTitleDark: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: '#f5f6fa',
        marginBottom: 20,
    },
    option: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f8fafd',
        borderWidth: 1,
        borderColor: '#e6e6e6',
    },
    optionDark: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#2e3350',
        borderWidth: 1,
        borderColor: '#2e3350',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#222f3e',
        marginLeft: 16,
    },
    optionTextDark: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#f5f6fa',
        marginLeft: 16,
    },
    logoutButtonGradient: {
        borderRadius: 12,
        marginTop: 20,
        marginHorizontal: 8,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    logoutButtonText: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: '#fff',
        marginLeft: 12,
    },
});