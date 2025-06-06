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
import { LinearGradient } from 'expo-linear-gradient';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import defaultUser from '../assets/imgs/default_user.png'; // ✅ Ensure this path is correct


export default function Coach() {
    const router = useRouter();
    const scheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(true);

    const colors =
        scheme === 'dark'
            ? {
                background: '#181c24',
                headerGradient: ['#23243a', '#1a1c3e'],
                textPrimary: '#f5f6fa',
                textSecondary: '#aaaaaa',
                cardBackground: '#23243a',
                avatarBackground: '#2c2c2c',
                emojiColor: '#8ab4f8',
                chevronColor: '#888',
                shadow: 'rgba(0, 0, 0, 0.7)',
                signOutColor: '#fff',
                divider: '#2e3350',
            }
            : {
                background: '#f4f8fb',
                headerGradient: ['#6dd5ed', '#2193b0', '#4c669f'],
                textPrimary: '#222f3e',
                textSecondary: '#7f8c8d',
                cardBackground: '#fff',
                avatarBackground: '#e3eafc',
                emojiColor: '#1976d2',
                chevronColor: '#b0b0b0',
                shadow: 'rgba(25, 118, 210, 0.08)',
                signOutColor: '#fff',
                divider: '#e6e6e6',
            };

    useEffect(() => {
        const fetchName = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const user = jwtDecode(token);
                    setFirstName(user.firstName || '');
                }
            } catch (error) {
                console.error('Token decode error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchName();
    }, []);

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={async () => {
                        await removeToken(); // Clear the token
                        router.replace('/login'); // Redirect to login
                    }}
                >
                    <Text style={styles.closeText}>Sign-out</Text>
                </TouchableOpacity>
                <View style={styles.avatar} />
                <Text style={styles.name}>{firstName}</Text>
                {/* <Text style={styles.name}>{firstName}</Text> */}
                <Text style={styles.role}>Coach</Text>
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
                    <MenuItem icon="📷" label="All Pictures" />
                    <MenuItem icon="❤️" label="Favourites" />
                    <MenuItem icon="⚙️" label="Settings" />
                </View>
            </View>
        );
    }

    const handleSignOut = async () => {
        await removeToken();
        router.replace('/login');
    };

    const MenuItem = ({ icon, label, onPress }) => {
        const [pressed, setPressed] = useState(false);
        return (
            <TouchableOpacity
                style={[
                    styles.menuItem,
                    {
                        backgroundColor: colors.cardBackground,
                        shadowColor: colors.shadow,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.8}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
            >
                <View style={[styles.menuIconCircle, { backgroundColor: colors.avatarBackground }]}>
                    <Text style={[styles.menuIcon, { color: colors.emojiColor }]}>{icon}</Text>
                </View>
                <Text
                    style={[
                        styles.menuLabel,
                        { color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
                    ]}
                >
                    {label}
                </Text>
                <Text style={[styles.chevron, { color: colors.chevronColor }]}>›</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={colors.headerGradient} style={styles.header}>
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Text style={[styles.signOutText, { color: colors.signOutColor }]}>
                        Sign-out
                    </Text>
                </TouchableOpacity>

                <View style={styles.profileContainer}>
                    <LinearGradient
                        colors={['#8ab4f8', '#1976d2', '#192f6a']}
                        style={styles.avatarGradient}
                    >
                        <Image
                            source={defaultUser}
                            style={[
                                styles.avatar,
                                { shadowColor: colors.shadow },
                            ]}
                            resizeMode="cover"
                        />
                    </LinearGradient>
                    <Text style={[styles.name, { color: '#fff', fontFamily: 'Poppins_700Bold' }]}>
                        {firstName || 'Coach'}
                    </Text>
                    <Text
                        style={[
                            styles.role,
                            { color: '#e0e0e0', fontFamily: 'Poppins_400Regular' },
                        ]}
                    >
                        Coach
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.menuContainer}>
                <MenuItem icon="👤" label="Personal Information" onPress={() => router.push('/pi')} />
                <MenuItem icon="🎓" label="Students" onPress={() => router.push('/student-list')} />
                <MenuItem icon="🎬" label="All Videos" onPress={() => { }} />
                <MenuItem icon="📷" label="All Pictures" onPress={() => { }} />
                <MenuItem icon="❤️" label="Favourites" onPress={() => { }} />
                <MenuItem icon="⚙️" label="Settings" onPress={() => { }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.10)',
        borderRadius: 8,
    },
    signOutText: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        letterSpacing: 0.2,
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
    },
    role: {
        fontSize: 17,
        marginBottom: 6,
        opacity: 0.85,
        letterSpacing: 0.2,
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
        marginBottom: 0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
        marginVertical: 2,
    },
    menuIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    menuIcon: {
        fontSize: 28,
        textAlign: 'center',
    },
    menuLabel: {
        fontSize: 20,
        flex: 1,
        marginLeft: 2,
    },
    chevron: {
        fontSize: 22,
        marginLeft: 8,
    },
});
