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
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centered}>
                <ActivityIndicator size="large" color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={scheme === 'dark' ? styles.keyboardAvoidingViewDark : styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={scheme === 'dark' ? styles.wrapperDark : styles.wrapper} keyboardShouldPersistTaps="handled">
                {/* Gradient Header */}
                <LinearGradient
                    colors={scheme === 'dark' ? ['#23243a', '#1a1c3e'] : ['#6dd5ed', '#2193b0', '#4c669f']}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() =>
                            router.canGoBack() ? router.back() : router.replace('/student')
                        }
                    >
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Personal Information
                    </Text>
                </LinearGradient>

                {/* Form Card */}
                <View style={scheme === 'dark' ? styles.cardDark : styles.card}>
                    {/* Full Name Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={scheme === 'dark' ? styles.labelDark : styles.label}>
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
                                        style={scheme === 'dark' ? styles.inputFirstNameDark : styles.inputFirstName}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        placeholder="First Name"
                                        placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                                    />
                                    <TextInput
                                        style={scheme === 'dark' ? styles.inputLastNameDark : styles.inputLastName}
                                        value={lastName}
                                        onChangeText={setLastName}
                                        placeholder="Last Name"
                                        placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setEditFullName(false)}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={30}
                                            color="#28a745"
                                        />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={scheme === 'dark' ? styles.valueTextDark : styles.valueText}>
                                        {firstName || '—'} {lastName || '—'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setEditFullName(true)}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons name="create-outline" size={26} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
                                    </TouchableOpacity >
                                </>
                            )
                            }
                        </View >
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

                    {/* Username Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={scheme === 'dark' ? styles.labelDark : styles.label}>
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
                                        style={scheme === 'dark' ? styles.inputUserNameDark : styles.inputUserName}
                                        value={userName}
                                        onChangeText={setUserName}
                                        placeholder="Username"
                                        placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setEditUserName(false)}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={30}
                                            color="#28a745"
                                        />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={scheme === 'dark' ? styles.valueTextDark : styles.valueText}>
                                        {userName || '—'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setEditUserName(true)}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons name="create-outline" size={26} color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
                                    </TouchableOpacity >
                                </>
                            )
                            }
                        </View >
                        {!!userNameError && (
                            <Text style={scheme === 'dark' ? styles.errorTextDark : styles.errorText}>
                                {userNameError}
                            </Text>
                        )}
                    </View>

                    {/* Email Field (Read-Only) */}
                    <View style={styles.fieldContainer}>
                        <Text style={scheme === 'dark' ? styles.labelDark : styles.label}>
                            Email
                        </Text>
                        <TextInput
                            style={scheme === 'dark' ? styles.inputEmailDark : styles.inputEmail}
                            value={email}
                            editable={false}
                            placeholder="Email"
                            placeholderTextColor={scheme === 'dark' ? '#888' : '#b0b0b0'}
                        />
                    </View >

                    {/* Save Button */}
                    < LinearGradient
                        colors={scheme === 'dark' ? ['#1976d2', '#3b5998'] : ['#1976d2', '#4c669f']}
                        style={styles.saveButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={onSave}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.saveButtonText}>
                                Save Changes
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient >
                </View >
            </ScrollView >
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    // Light theme styles
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

    // Dark theme styles
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

    // Common styles
    header: {
        height: 120,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingTop: 50,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
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
        fontFamily: 'Poppins_700Bold',
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
