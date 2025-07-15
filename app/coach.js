import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { getToken, removeToken } from '../utils/tokenStorage';
import { getUserDetails } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function Coach() {
    const router = useRouter();
    const scheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    const [firstName, setFirstName] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const defaultProfilePhoto = require('../assets/imgs/default_user.png');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const user = jwtDecode(token);
                    setFirstName(user.firstName || 'Coach');
                    setUserId(user.id || user.userId || user._id);
                    const res = await getUserDetails(user.id || user.userId || user._id);

                    if (user.profilePhoto) {
                        setProfilePhoto(user.profilePhoto);
                    }
                }
            } catch (err) {
                //console.error('Failed to fetch user:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        await removeToken();
        router.replace('/login');
    };

    const MenuItem = ({ icon, label, onPress }) => (
        <TouchableOpacity
            style={scheme === 'dark' ? styles.menuItemDark : styles.menuItem}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={scheme === 'dark' ? styles.menuIconCircleDark : styles.menuIconCircle}>
                <Text style={scheme === 'dark' ? styles.menuIconDark : styles.menuIcon}>{icon}</Text>
            </View>
            <Text style={scheme === 'dark' ? styles.menuLabelDark : styles.menuLabel}>{label}</Text>
            <Text style={scheme === 'dark' ? styles.chevronDark : styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    if (!fontsLoaded || loading) {
        return (
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centered}>
                <ActivityIndicator size="large" color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
            </View>
        );
    }

    return (
        <View style={scheme === 'dark' ? styles.containerDark : styles.container}>
            <LinearGradient
                colors={scheme === 'dark' ? ['#23243a', '#1a1c3e'] : ['#6dd5ed', '#2193b0', '#4c669f']}
                style={styles.header}
            >
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign-out</Text>
                </TouchableOpacity>
                <View style={styles.profileContainer}>
                    <LinearGradient
                        colors={['#8ab4f8', '#1976d2', '#192f6a']}
                        style={styles.avatarGradient}
                    >
                        <Image
                            source={profilePhoto ? { uri: profilePhoto } : defaultProfilePhoto}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                    </LinearGradient>
                    <Text style={styles.name}>{firstName}</Text>
                    <Text style={styles.role}>Coach</Text>
                </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.menuContainer}>
                <View style={styles.menu}>
                    <MenuItem
                        icon="👤"
                        label="Personal Information"
                        onPress={() => router.push('/pi')}
                    />
                    <MenuItem
                        icon="🎓"
                        label="Students"
                        onPress={() => router.push('/student-list')}
                    />
                    <MenuItem
                        icon="🎬"
                        label="All Videos"
                        onPress={() => router.push('/all-videos')}
                    />
                    <MenuItem
                        icon="📷"
                        label="All Pictures"
                        onPress={() => router.push('/allpictures')}
                    />
                    <MenuItem
                        icon="❤️"
                        label="Favourites"
                        onPress={() => router.push('/favourites')}
                    />
                    <MenuItem
                        icon="🏏"
                        label="Drills"
                        onPress={() => router.push('/drills')}
                    />
                    <MenuItem
                        icon="⚙️"
                        label="Settings"
                        onPress={() => router.push('/settings')}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Light theme styles
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f8fb',
    },
    header: {
        height: 280,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    signOutBtn: {
        position: 'absolute',
        top: 50,
        right: 24,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.10)',
        borderRadius: 8,
    },
    signOutText: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        letterSpacing: 0.2,
        color: '#fff',
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 8,
    },
    avatarGradient: {
        width: 110,
        height: 110,
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
    },
    name: {
        fontSize: 28,
        marginBottom: 2,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.18)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        fontFamily: 'Poppins_700Bold',
        color: '#fff',
    },
    role: {
        fontSize: 17,
        marginBottom: 6,
        opacity: 0.85,
        letterSpacing: 0.2,
        fontFamily: 'Poppins_400Regular',
        color: '#e0e0e0',
    },
    menuContainer: {
        paddingHorizontal: 18,
        paddingTop: 32,
        paddingBottom: 40,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginVertical: 6,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
        backgroundColor: '#fff',
        shadowColor: 'rgba(25, 118, 210, 0.08)',
    },
    menuIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#e3eafc',
    },
    menuIcon: {
        fontSize: 28,
        textAlign: 'center',
        color: '#1976d2',
    },
    menuLabel: {
        fontSize: 18,
        flex: 1,
        fontFamily: 'Poppins_600SemiBold',
        color: '#222f3e',
    },
    chevron: {
        fontSize: 20,
        marginLeft: 8,
        color: '#b0b0b0',
    },
    menu: {
        flex: 1,
    },
    // Dark theme styles
    containerDark: {
        flex: 1,
        backgroundColor: '#181c24',
    },
    centeredDark: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181c24',
    },
    menuItemDark: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginVertical: 6,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
        backgroundColor: '#23243a',
        shadowColor: 'rgba(0, 0, 0, 0.7)',
    },
    menuIconCircleDark: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#2c2c2c',
    },
    menuIconDark: {
        fontSize: 28,
        textAlign: 'center',
        color: '#8ab4f8',
    },
    menuLabelDark: {
        fontSize: 18,
        flex: 1,
        fontFamily: 'Poppins_600SemiBold',
        color: '#f5f6fa',
    },
    chevronDark: {
        fontSize: 20,
        marginLeft: 8,
        color: '#888',
    },
});