import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Student() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
      <View style={styles.avatar} />
      <Text style={styles.name}>Brian</Text>
      <Text style={styles.role}>Student</Text>
      <View style={styles.menu}>
        <MenuItem icon="👤" label="Personal Information" />
        <MenuItem icon="🧑‍🏫" label="Coaches" />
        <MenuItem icon="🎬" label="All videos" />
        <MenuItem icon="📷" label="All Pictures" />
        <MenuItem icon="🏏" label="Drills" />
        <MenuItem icon="⚙️" label="Settings" />
      </View>
    </View>
  );
}

function MenuItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 60 },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  closeText: { fontSize: 32, color: '#333' },
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