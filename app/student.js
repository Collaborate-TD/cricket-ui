import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    useColorScheme,
    Dimensions,
    Image,
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
import DefaultUser from '../assets/imgs/default_user.png';

const { width } = Dimensions.get('window');

export default function Student() {
    const router = useRouter();
    const scheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(true);

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

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={async () => {
                    await removeToken();
                    router.replace('/login');
                }}
            >
                <Text style={styles.closeText}>Sign-out</Text>
            </TouchableOpacity>
            <View style={styles.avatar} />
            <Text style={styles.name}>{firstName}</Text>
            <Text style={styles.role}>Student</Text>
            <View style={styles.menu}>
                <MenuItem
                    icon="👤"
                    label="Personal Information"
                    onPress={() => router.push('/pi')}
                />
                <MenuItem
                    icon="🏏"
                    label="Coaches"
                    onPress={() => router.push('/coach-list')}
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

const MenuItem = ({ emoji, label, onPress }) => {
    const [pressed, setPressed] = useState(false);
    return (
        <TouchableOpacity
            style={[
                styles.menuCard,
                {
                    backgroundColor: colors.cardBackground,
                    shadowColor: colors.shadow,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                },
            ]}
            onPress={onPress}
            activeOpacity={0.85}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            <View style={styles.menuIconCircle}>
                <Text style={[styles.emojiIcon, { color: colors.emojiColor }]}>{emoji}</Text>
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

// return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//         {/* Gradient Header */}
//         <LinearGradient colors={colors.headerGradient} style={styles.header}>
//             <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
//                 <Text style={styles.logoutText}>Sign-out</Text>
//             </TouchableOpacity>

//             <View style={styles.profileContainer}>
//                 {/* Avatar with default image */}
//                 <LinearGradient
//                     colors={['#8ab4f8', '#1976d2', '#192f6a']}
//                     style={styles.avatarGradient}
//                 >
//                     <Image
//                         source={DefaultUser}
//                         style={[styles.avatarImage, { backgroundColor: colors.avatarBackground }]}
//                         resizeMode="cover"
//                     />
//                 </LinearGradient>

//                 <Text style={[styles.name, { color: '#fff', fontFamily: 'Poppins_700Bold' }]}>
//                     {firstName || 'User'}
//                 </Text>
//                 <Text style={[styles.role, { color: '#e0e0e0', fontFamily: 'Poppins_400Regular' }]}>
//                     Student
//                 </Text>
//                 <Text style={styles.welcomeText}>Welcome back! Ready to play?</Text>
//             </View>
//         </LinearGradient>

//         {/* Menu Items */}
//         <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
//             <MenuItem emoji="👤" label="Personal Information" onPress={() => router.push('/pi')} />
//             <View style={[styles.divider, { backgroundColor: colors.divider }]} />
//             <MenuItem emoji="🏏" label="Coaches" onPress={() => router.push('/coach-list')} />
//             <View style={[styles.divider, { backgroundColor: colors.divider }]} />
//             <MenuItem emoji="🎬" label="All videos" onPress={() => { }} />
//             <View style={[styles.divider, { backgroundColor: colors.divider }]} />
//             <MenuItem emoji="📷" label="All Pictures" onPress={() => { }} />
//             <View style={[styles.divider, { backgroundColor: colors.divider }]} />
//             <MenuItem emoji="❤️" label="Favourites" onPress={() => { }} />
//             <View style={[styles.divider, { backgroundColor: colors.divider }]} />
//             <MenuItem emoji="⚙️" label="Settings" onPress={() => { }} />
//         </ScrollView>
//     </View>
// );

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 320,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingTop: 60,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    logoutButton: {
        position: 'absolute',
        top: 50,
        right: 24,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.10)',
        borderRadius: 8,
        zIndex: 2,
    },
    logoutText: {
        color: '#fff',
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
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarImage: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 2,
        borderColor: '#fff',
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
    welcomeText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(25, 118, 210, 0.25)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 12,
        letterSpacing: 0.4,
        fontFamily: 'Poppins_600SemiBold',
        backgroundColor: 'rgba(25, 118, 210, 0.10)',
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuContainer: {
        paddingHorizontal: 18,
        paddingTop: 32,
        paddingBottom: 40,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    menuCard: {
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
        backgroundColor: '#fff',
        marginVertical: 2,
    },
    menuIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    emojiIcon: {
        fontSize: 28,
        textAlign: 'center',
    },
    menuLabel: {
        fontSize: 20,
        flex: 1,
        marginLeft: 2,
    },
    chevron: {
        fontSize: 24,
        marginLeft: 8,
    },
    divider: {
        height: 1.5,
        marginVertical: 7,
        marginHorizontal: 16,
        borderRadius: 1,
        opacity: 0.7,
    },
});
