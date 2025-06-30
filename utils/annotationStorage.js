import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAnnotationsLocally = async (videoId, annotationData) => {
  try {
    await AsyncStorage.setItem(
      `annotations_${videoId}`,
      JSON.stringify(annotationData)
    );
    return true;
  } catch (e) {
    // Optionally log error
    return false;
  }
};

export const loadAnnotationsLocally = async (videoId) => {
  try {
    const data = await AsyncStorage.getItem(`annotations_${videoId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    // Optionally log error
    return null;
  }
};

export const removeAnnotationsLocally = async (videoId) => {
  try {
    await AsyncStorage.removeItem(`annotations_${videoId}`);
    return true;
  } catch (e) {
    return false;
  }
};