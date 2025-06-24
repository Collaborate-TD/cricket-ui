import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../utils/tokenStorage';
import { getUserDetails, updateUser, uploadProfilePhoto } from '../services/api';
import { showAlert } from '../utils/alertMessage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import CustomHeader from '../components/CustomHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PersonalInfo() {
  const router = useRouter();
  const scheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [editFullName, setEditFullName] = useState(false);
  const [editUserName, setEditUserName] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState(''); // Added to determine defaultRoute

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          showAlert('Error', 'No authentication token found');
          return;
        }
        const user = jwtDecode(token);
        const id = user.id || user.userId || user._id;
        if (!id) {
          showAlert('Error', 'Invalid user token');
          return;
        }
        setUserId(id);
        setRole(user.role || 'student'); // Set role from token
        const res = await getUserDetails(id);
        if (res && res.data) {
          setFirstName(res.data.firstName || '');
          setLastName(res.data.lastName || '');
          setUserName(res.data.userName || '');
          setEmail(res.data.email || '');
          const initialPhotoUri = res.data.profilePhoto
            ? `${process.env.API_URL || 'http://192.168.2.13:5000'}/data/profile/${id}/${res.data.profilePhoto}?t=${Date.now()}`
            : null;
          setPhotoUri(initialPhotoUri);
          setUploadedFileName(res.data.profilePhoto || null);
          //console.log('photoUri initial:', initialPhotoUri);
        }
      } catch (err) {
        //console.error('Fetch user data error:', err.message);
        showAlert('Error', 'Failed to fetch user data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    let valid = true;
    if (!firstName.trim()) {
      setFirstNameError('First name cannot be empty');
      valid = false;
    } else {
      setFirstNameError('');
    }
    if (!lastName.trim()) {
      setLastNameError('Last name cannot be empty');
      valid = false;
    } else {
      setLastNameError('');
    }
    if (!userName.trim()) {
      setUserNameError('Username cannot be empty');
      valid = false;
    } else {
      setUserNameError('');
    }
    return valid;
  };

  const handlePhotoSelect = async (newPhoto) => {
    if (newPhoto) {
      try {
        //console.log('Uploading photo:', newPhoto);
        setUploading(true);
        const fileName = await uploadProfilePhoto(newPhoto);
        if (fileName) {
          setPhoto(newPhoto);
          setUploadedFileName(fileName);
          const newPhotoUri = `${process.env.API_URL || 'http://192.168.2.13:5000'}/data/profile/${userId}/${fileName}?t=${Date.now()}`;
          setPhotoUri(newPhotoUri);
          //console.log('Photo uploaded successfully, updated photoUri:', newPhotoUri);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } else {
          //console.warn('Photo upload failed - no fileName returned');
          showAlert('Error', 'Failed to upload photo. Please try again.');
        }
      } catch (error) {
        //console.error('Photo upload error:', error.message);
        showAlert('Error', 'Failed to upload photo. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const onSave = async () => {
    if (!validate()) return;
    try {
      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: userName.trim(),
      };
      //console.log('Saving user data:', data);
      //console.log('Photo to save:', photo);
      //console.log('Uploaded fileName:', uploadedFileName);
      await updateUser(userId, data, photo);
      showAlert('Success', 'Information updated successfully!');
      setEditFullName(false);
      setEditUserName(false);
      setPhoto(null);
      if (uploadedFileName) {
        const updatedPhotoUri = `${process.env.API_URL || 'http://192.168.2.13:5000'}/data/profile/${userId}/${uploadedFileName}?t=${Date.now()}`;
        setPhotoUri(updatedPhotoUri);
      }
      //console.log('Save completed. Current photoUri:', photoUri);
      router.replace('/pi');
    } catch (err) {
      //console.error('Update error:', err.message, err.response?.data);
      showAlert('Error', err.response?.data?.message || 'Failed to update information');
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={scheme === 'dark' ? styles.centeredDark : styles.centered}>
        <CustomHeader
          title="Personal Information"
          defaultRoute={role === 'coach' ? '/coach' : '/student'}
        />
        <ActivityIndicator size="large" color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
        <Text style={scheme === 'dark' ? styles.loadingTextDark : styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={scheme === 'dark' ? styles.keyboardAvoidingViewDark : styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomHeader
        title="Personal Information"
        defaultRoute={role === 'coach' ? '/coach' : '/student'}
      />
      <ScrollView
        contentContainerStyle={scheme === 'dark' ? styles.wrapperDark : styles.wrapper}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <ProfilePhotoUploader
            photoUri={photo?.uri || photoUri}
            setPhoto={handlePhotoSelect}
            defaultImage={require('../assets/default-user.png')}
            uploading={uploading}
          />
          <View style={styles.fieldContainer}>
            <Text style={scheme === 'dark' ? styles.labelDark : styles.label}>Full Name</Text>
            <View
              style={styles.valueRow}
              onLayout={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              }}
            >
              {editFullName ? (
                <>
                  <TextInput
                    style={scheme === 'dark' ? styles.inputFirstNameDark : styles.inputFirstName}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={scheme === 'dark' ? styles.inputLastNameDark : styles.inputLastName}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    onPress={() => setEditFullName(false)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="checkmark-circle" size={30} color="#28a745" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={scheme === 'dark' ? styles.valueTextDark : styles.valueText}>
                    {firstName && lastName ? `${firstName} ${lastName}` : 'No name set'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditFullName(true)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="create-outline"
                      size={26}
                      color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
            {!!firstNameError && (
              <Text style={scheme === 'dark' ? styles.errorTextDark : styles.errorText}>
                {firstNameError}
              </Text>
            )}
            {!!lastNameError && (
              <Text style={scheme === 'dark' ? styles.errorTextDark : styles.errorText}>
                {lastNameError}
              </Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={scheme === 'dark' ? styles.labelDark : styles.label}>Username</Text>
            <View
              style={styles.valueRow}
              onLayout={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              }}
            >
              {editUserName ? (
                <>
                  <TextInput
                    style={scheme === 'dark' ? styles.inputUserNameDark : styles.inputUserName}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Username"
                    placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setEditUserName(false)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="checkmark-circle" size={30} color="#28a745" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={scheme === 'dark' ? styles.valueTextDark : styles.valueText}>
                    {userName || 'No username set'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditUserName(true)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="create-outline"
                      size={26}
                      color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
            {!!userNameError && (
              <Text style={scheme === 'dark' ? styles.errorTextDark : styles.errorText}>
                {userNameError}
              </Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={scheme === 'dark' ? styles.labelDark : styles.label}>Email</Text>
            <TextInput
              style={scheme === 'dark' ? styles.inputEmailDark : styles.inputEmail}
              value={email}
              editable={false}
              placeholder="No email set"
              placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
            />
          </View>
          <LinearGradient
            colors={scheme === 'dark' ? ['#1976d2', '#3b5998'] : ['#1976d2', '#4c669f']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#f4f8fb',
  },
  wrapper: {
    paddingBottom: 40,
    backgroundColor: '#f4f8fb',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 28,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 22,
    shadowColor: 'rgba(25, 118, 210, 0.10)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 7,
    letterSpacing: 0.1,
    fontFamily: 'Poppins_600SemiBold',
  },
  valueText: {
    fontSize: 17,
    color: '#222f3e',
    paddingVertical: 10,
    paddingLeft: 6,
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
  inputFirstName: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#222f3e',
    backgroundColor: '#f8fafd',
    marginBottom: 0,
  },
  inputLastName: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#222f3e',
    backgroundColor: '#f8fafd',
    marginBottom: 0,
  },
  inputUserName: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#222f3e',
    backgroundColor: '#f8fafd',
    marginBottom: 0,
  },
  inputEmail: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#222f3e',
    backgroundColor: '#f0f0f0',
    marginBottom: 0,
    fontFamily: 'Poppins_400Regular',
  },
  errorText: {
    color: '#c0392b',
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  centeredDark: {
    flex: 1,
    backgroundColor: '#181c24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingViewDark: {
    flex: 1,
    backgroundColor: '#181c24',
  },
  wrapperDark: {
    paddingBottom: 40,
    backgroundColor: '#181c24',
  },
  cardDark: {
    backgroundColor: '#23243a',
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 28,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 22,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  labelDark: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8ab4f8',
    marginBottom: 7,
    letterSpacing: 0.1,
    fontFamily: 'Poppins_600SemiBold',
  },
  valueTextDark: {
    fontSize: 17,
    color: '#f5f6fa',
    paddingVertical: 10,
    paddingLeft: 6,
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
  inputFirstNameDark: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#f5f6fa',
    backgroundColor: '#23243a',
    marginBottom: 0,
  },
  inputLastNameDark: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#f5f6fa',
    backgroundColor: '#23243a',
    marginBottom: 0,
  },
  inputUserNameDark: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#f5f6fa',
    backgroundColor: '#23243a',
    marginBottom: 0,
  },
  inputEmailDark: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#dcdfe3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#f5f6fa',
    backgroundColor: '#23243a',
    marginBottom: 0,
    fontFamily: 'Poppins_400Regular',
  },
  errorTextDark: {
    color: '#e74c3c',
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  loadingTextDark: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins_400Regular',
  },
  fieldContainer: {
    marginBottom: 22,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  saveButtonGradient: {
    borderRadius: 10,
    marginTop: 18,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
});