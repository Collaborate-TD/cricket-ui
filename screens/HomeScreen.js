import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';

// Add this function inside your HomeScreen component
const testBackendConnection = async () => {
  try {
    console.log("Testing connection to: https://cricketlog-server.onrender.com/health");
    const response = await fetch('https://cricketlog-server.onrender.com/health');
    const data = await response.json();
    console.log('Backend connection successful:', data);
    Alert.alert('Success', 'Connected to backend successfully!');
  } catch (error) {
    console.error('Backend connection failed:', error);
    Alert.alert('Connection Failed', `Error: ${error.message}`);
  }
};

// Add a test button to your existing UI
<Button 
  title="Test Backend Connection" 
  onPress={testBackendConnection} 
/>