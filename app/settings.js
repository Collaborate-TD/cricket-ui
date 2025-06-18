import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  const handleOptionPress = (option) => {
    Alert.alert(option, `${option} screen not implemented yet.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1976d2" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Settings</Text>

      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Profile Settings')}>
          <Ionicons name="person-circle-outline" size={22} color="#1976d2" />
          <Text style={styles.optionText}>Profile Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Notification Preferences')}>
          <Ionicons name="notifications-outline" size={22} color="#1976d2" />
          <Text style={styles.optionText}>Notification Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Video Storage')}>
          <MaterialIcons name="video-library" size={22} color="#1976d2" />
          <Text style={styles.optionText}>Video Storage Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Annotation Tools')}>
          <Ionicons name="brush-outline" size={22} color="#1976d2" />
          <Text style={styles.optionText}>Annotation Tool Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Feedback Templates')}>
          <Ionicons name="document-text-outline" size={22} color="#1976d2" />
          <Text style={styles.optionText}>Feedback Template Customization</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('About')}>
          <Ionicons name="information-circle-outline" size={22} color="#1976d2" />
          <Text style={styles.optionText}>About the App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutOption}
          onPress={() => Alert.alert('Logout', 'Logged out successfully.')}
        >
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f4f8fb',
    flexGrow: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#1976d2',
    marginLeft: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 16,
    color: 'red',
  },
});