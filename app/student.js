import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
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

import defaultUser from '../assets/imgs/default_user.png';

export default function Student() {
  const router = useRouter();
  const scheme = useColorScheme();

  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const colors = scheme === 'dark'
    ? {
        background: '#181c24',
        headerGradient: ['#23243a', '#1a1c3e'],
        textPrimary: '#f5f6fa',
        textSecondary: '#aaaaaa',
        cardBackground: '#23243a',
        avatarBackground: '#2c2c2c',
        emojiColor: '#8ab4f8',
        chevronColor: '#888',
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
        signOutColor: '#fff',
        divider: '#e6e6e6',
      };

  useEffect(() => {
    const fetchName = async () => {
      const token = await getToken();
      if (token) {
        const user = jwtDecode(token);
        setFirstName(user.firstName || 'Student');
      }
      setLoading(false);
    };
    fetchName();
  }, []);

  const handleSignOut = async () => {
    await removeToken();
    router.replace('/login');
  };

  const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.avatarBackground }]}>
        <Text style={[styles.icon, { color: colors.emojiColor }]}>{icon}</Text>
      </View>
      <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.chevron, { color: colors.chevronColor }]}>›</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.emojiColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.headerGradient} style={styles.header}>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={[styles.signOutText, { color: colors.signOutColor }]}>Sign-out</Text>
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <LinearGradient
            colors={['#8ab4f8', '#1976d2', '#192f6a']}
            style={styles.avatarGradient}
          >
            <Image source={defaultUser} style={styles.avatar} resizeMode="cover" />
          </LinearGradient>
          <Text style={[styles.name, { color: '#fff' }]}>{firstName}</Text>
          <Text style={[styles.role, { color: '#e0e0e0' }]}>Student</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.menuWrapper}>
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
          <MenuItem
            icon="📷"
            label="All Pictures"
            onPress={() => router.push('/allpictures')}
          />
          <MenuItem
            icon="❤"
            label="Favourites"
            onPress={() => router.push('/favourites')}
          />
          <MenuItem
            icon="⚙"
            label="Settings"
            onPress={() => router.push('/settings')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    height: 280,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 28,
    marginBottom: 2,
    fontFamily: 'Poppins_700Bold',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  role: {
    fontSize: 17,
    marginBottom: 6,
    fontFamily: 'Poppins_400Regular',
  },
  menuWrapper: {
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
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 18,
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
  },
  chevron: {
    fontSize: 20,
    marginLeft: 8,
  },
  menu: {
    flex: 1,
  },
});