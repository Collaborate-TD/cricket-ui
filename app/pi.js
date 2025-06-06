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
import { getUserDetails, updateUser } from '../services/api.js';
import { showAlert } from '../utils/alertMessage.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function PersonalInfo() {
  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const router = useRouter();
  const scheme = useColorScheme();

  // Load Custom Fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Local State
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [editFullName, setEditFullName] = useState(false);
  const [editUserName, setEditUserName] = useState(false);

  // Validation Errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [userNameError, setUserNameError] = useState('');

  // Fetch User Details on Mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token found');
        const user = jwtDecode(token);
        const id = user.id || user.userId || user._id;
        setUserId(id);

        const res = await getUserDetails(id);
        setFirstName(res.data.firstName || '');
        setLastName(res.data.lastName || '');
        setUserName(res.data.userName || '');
        setEmail(res.data.email || '');
      } catch (err) {
        showAlert('Error', 'Failed to load user information');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Validate Inputs
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

  // Save Handler
  const onSave = async () => {
    if (!validate()) return;
    try {
      await updateUser(userId, { firstName, lastName, userName });
      showAlert('Success', 'Information updated!');
      setEditFullName(false);
      setEditUserName(false);
    } catch (err) {
      showAlert('Error', 'Failed to update information');
    }
  };

  // Loading State (Fonts OR Data)
  if (!fontsLoaded || loading) {
    return (
      <View style={stylesCentered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  // Color Palettes
  const colors =
    scheme === 'dark'
      ? {
          background: '#181c24',
          cardBackground: '#23243a',
          text: '#f5f6fa',
          label: '#8ab4f8',
          placeholder: '#888',
          inputBackground: '#23243a',
          readOnlyBackground: '#23243a',
          headerGradient: ['#23243a', '#1a1c3e'],
          buttonGradient: ['#1976d2', '#3b5998'],
          buttonText: '#fff',
          icon: '#8ab4f8',
          successIcon: '#28a745',
          errorText: '#e74c3c',
          shadow: 'rgba(0,0,0,0.25)',
        }
      : {
          background: '#f4f8fb',
          cardBackground: '#fff',
          text: '#222f3e',
          label: '#1976d2',
          placeholder: '#b0b0b0',
          inputBackground: '#f8fafd',
          readOnlyBackground: '#f0f0f0',
          headerGradient: ['#6dd5ed', '#2193b0', '#4c669f'],
          buttonGradient: ['#1976d2', '#4c669f'],
          buttonText: '#fff',
          icon: '#1976d2',
          successIcon: '#28a745',
          errorText: '#c0392b',
          shadow: 'rgba(25, 118, 210, 0.10)',
        };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        {/* Gradient Header */}
        <LinearGradient colors={colors.headerGradient} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/student')
            }
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: 'Poppins_700Bold' }]}>
            Personal Information
          </Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Full Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { fontFamily: 'Poppins_600SemiBold' }]}>
              Full Name
            </Text>
            <View
              style={styles.valueRow}
              onLayout={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              }}
            >
              {editFullName ? (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, marginRight: 8, fontFamily: 'Poppins_400Regular' },
                    ]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    placeholderTextColor={colors.placeholder}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, fontFamily: 'Poppins_400Regular' },
                    ]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    placeholderTextColor={colors.placeholder}
                  />
                  <TouchableOpacity
                    onPress={() => setEditFullName(false)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={30}
                      color={colors.successIcon}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.valueText,
                      { flex: 1, fontFamily: 'Poppins_400Regular' },
                    ]}
                  >
                    {firstName || '—'} {lastName || '—'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditFullName(true)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="create-outline" size={26} color={colors.icon} />
                  </TouchableOpacity>
                </>
              )}
            </View>
            {!!firstNameError && (
              <Text style={[styles.errorText, { fontFamily: 'Poppins_400Regular' }]}>
                {firstNameError}
              </Text>
            )}
            {!!lastNameError && (
              <Text style={[styles.errorText, { fontFamily: 'Poppins_400Regular' }]}>
                {lastNameError}
              </Text>
            )}
          </View>

          {/* Username Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { fontFamily: 'Poppins_600SemiBold' }]}>
              Username
            </Text>
            <View
              style={styles.valueRow}
              onLayout={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              }}
            >
              {editUserName ? (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, fontFamily: 'Poppins_400Regular' },
                    ]}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Username"
                    placeholderTextColor={colors.placeholder}
                  />
                  <TouchableOpacity
                    onPress={() => setEditUserName(false)}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={30}
                      color={colors.successIcon}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.valueText,
                      { flex: 1, fontFamily: 'Poppins_400Regular' },
                    ]}
                  >
                    {userName || '—'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditUserName(true)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="create-outline" size={26} color={colors.icon} />
                  </TouchableOpacity>
                </>
              )}
            </View>
            {!!userNameError && (
              <Text style={[styles.errorText, { fontFamily: 'Poppins_400Regular' }]}>
                {userNameError}
              </Text>
            )}
          </View>

          {/* Email Field (Read-Only) */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { fontFamily: 'Poppins_600SemiBold' }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.readOnlyBackground,
                  fontFamily: 'Poppins_400Regular',
                  color: colors.text,
                },
              ]}
              value={email}
              editable={false}
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Save Button */}
          <LinearGradient
            colors={colors.buttonGradient}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  { color: colors.buttonText, fontFamily: 'Poppins_700Bold' },
                ]}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles Factory
const getStyles = (colors) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      paddingBottom: 40,
      backgroundColor: colors.background,
    },
    header: {
      height: 120,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      paddingTop: 50,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 10,
    },
    backButton: {
      marginRight: 16,
      padding: 4,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.2,
    },
    card: {
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginTop: 28,
      borderRadius: 18,
      paddingVertical: 28,
      paddingHorizontal: 22,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.13,
      shadowRadius: 10,
      elevation: 7,
    },
    fieldContainer: {
      marginBottom: 22,
    },
    label: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.label,
      marginBottom: 7,
      letterSpacing: 0.1,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    valueText: {
      fontSize: 17,
      color: colors.text,
      paddingVertical: 10,
      paddingLeft: 6,
    },
    input: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: '#dcdfe3',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      fontSize: 17,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      marginBottom: 0,
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
      shadowColor: colors.shadow,
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
    },
    errorText: {
      color: colors.errorText,
      marginTop: 4,
      fontSize: 14,
    },
  });

// Stand-alone style for loading state
const stylesCentered = {
  flex: 1,
  backgroundColor: '#f4f8fb',
  justifyContent: 'center',
  alignItems: 'center',
};