import React from 'react';
// import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import jwtDecode from 'jwt-decode';
import { getToken } from '../utils/tokenStorage';
import { removeToken } from '../utils/tokenStorage';

export default function Coach() {
   const router = useRouter();
  // const router = useRouter();
  // const [firstName, setFirstName] = useState('');

  // useEffect(() => {
  //   const fetchName = async () => {
  //     const token = await getToken();
  //     if (token) {
  //       const user = jwtDecode(token);
  //       setFirstName(user.userName); // This comes from your JWT payload
  //     }
  //   };
  //   fetchName();
  // }, []);

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
      <Text style={styles.name}>Archit</Text>
      {/* <Text style={styles.name}>{firstName}</Text> */}
      <Text style={styles.role}>Coach</Text>
      <View style={styles.menu}>
        <MenuItem
          icon="👤"
          label="Personal Information"
          onPress={() => router.push('/pi')}
        />
        <MenuItem icon="🎓" label="Students" />
        <MenuItem icon="🎬" label="All videos" />
        <MenuItem icon="📷" label="All Pictures" />
        <MenuItem icon="❤️" label="Favourites" />
        <MenuItem icon="⚙️" label="Settings" />
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 60 },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  closeText: { fontSize: 16, color: '#333' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', marginBottom: 16 },
  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  role: { fontSize: 16, color: '#888', marginBottom: 24 },
  menu: { width: '90%' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: { fontSize: 28, width: 40 },
  menuLabel: { fontSize: 18, fontWeight: 'bold' },
});