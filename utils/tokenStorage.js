import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setToken = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
  } else {
    await AsyncStorage.setItem('token', token);
  }
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  } else {
    return await AsyncStorage.getItem('token');
  }
};