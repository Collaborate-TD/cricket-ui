import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    useColorScheme,
    ScrollView,
    TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDrills, toggleFavourite, deleteDrills, createDrill } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import CustomHeader from '../components/CustomHeader';
import { showConfirm, showAlert } from '../utils/alertMessage';
import { uploadDrillVideo } from '../utils/fileUpload';

export default function Drills() {
    const [drills, setDrills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('student');
    const [selectMode, setSelectMode] = useState(false);
    const [selectedDrills, setSelectedDrills] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [drillTitle, setDrillTitle] = useState('');
    const [drillDescription, setDrillDescription] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [userId, setUserId] = useState(null);
    const router = useRouter();
    const params = useLocalSearchParams();
    const scheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    useEffect(() => {
        const getRoleAndUserId = async () => {
            const token = await getToken();
            const user = jwtDecode(token);
            setRole(user.role || 'student');
            setUserId(user.id || user._id); // <-- set userId here
        };
        getRoleAndUserId();
    }, []);

    const toggleFavorite = async (drillId) => {
        const currentDrill = drills.find(d => d._id === drillId);
        if (!currentDrill) return;

        const newValue = !currentDrill.isFavourite;

        try {
            setDrills(prev =>
                prev.map(drill =>
                    drill._id === drillId ? { ...drill, isFavourite: newValue } : drill
                )
            );

            await toggleFavourite(drillId, newValue);
        } catch (err) {
            console.error(err);
            // Revert UI on error
            setDrills(prev =>
                prev.map(drill =>
                    drill._id === drillId ? { ...drill, isFavourite: !newValue } : drill
                )
            );
        }
    };

    const handleDrillLongPress = (item) => {
        if (!selectMode) {
            setSelectMode(true);
            setSelectedDrills([item._id]);
        }
    };

    const toggleDrillSelection = (drillId) => {
        setSelectedDrills(prev => {
            if (prev.includes(drillId)) {
                const newSelection = prev.filter(id => id !== drillId);
                if (newSelection.length === 0) {
                    setSelectMode(false);
                }
                return newSelection;
            } else {
                return [...prev, drillId];
            }
        });
    };

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelectedDrills([]);
    };

    const handleDeleteSelected = () => {
        if (selectedDrills.length === 0) return;

        showConfirm(
            'Delete Drills',
            `Are you sure you want to delete ${selectedDrills.length} drill(s)? This action cannot be undone.`,
            deleteSelectedDrills // onConfirm
        );
    };

    const deleteSelectedDrills = async () => {
        setDeleting(true);
        try {
            console.log('Deleting drills:', selectedDrills);
            await deleteDrills(selectedDrills, userId);

            setDrills(prev => prev.filter(drill => !selectedDrills.includes(drill._id)));
            exitSelectMode();
        } catch (err) {
            console.error('Failed to delete drills:', err);
            showAlert('Error', 'Failed to delete drills. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedVideo(result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking video:', err);
            showAlert('Error', 'Failed to pick video. Please try again.');
        }
    };

    const handleUploadDrill = async () => {
        if (!drillTitle.trim()) {
            showAlert('Error', 'Please enter a drill title.');
            return;
        }

        if (!selectedVideo) {
            showAlert('Error', 'Please select a video file.');
            return;
        }

        setUploading(true);
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            const userId = user.id || user._id;

            // 1. Upload the video file to temp folder
            let uploadedVideo = null;
            if (selectedVideo) {
                const uploadedData = await uploadDrillVideo(selectedVideo); // Should return { fileName: ... }
                console.log('Uploaded video data:', uploadedData);
                uploadedVideo = uploadedData.fileName || {};
            }

            // 2. Prepare drill data with uploaded video filename
            const drillData = {
                title: drillTitle.trim(),
                description: drillDescription.trim(),
                fileName: uploadedVideo ? uploadedVideo.fileName : '', // or whatever your API returns
                userId: userId,
            };

            // 3. Submit drill data to main API
            await createDrill(drillData);

            // Reset form
            setDrillTitle('');
            setDrillDescription('');
            setSelectedVideo(null);
            setShowUploadForm(false);

            // Refresh drills list
            fetchDrills();

            showAlert('Success', 'Drill uploaded successfully!');
        } catch (err) {
            console.error('Failed to upload drill:', err);
            showAlert('Error', 'Failed to upload drill. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const fetchDrills = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const user = jwtDecode(token);
            const filter = {
                // ...(params.studentId && { studentId: params.studentId }),
                // ...(params.coachId && { coachId: params.coachId }),
                userId: user.id || user._id,
            };
            const res = await getDrills(filter);
            setDrills(res.data || []);
        } catch (err) {
            console.error('Failed to fetch drills:', err);
            setDrills([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrills();
    }, [params.studentId, params.coachId]);

    const favoritesCount = drills.filter(drill => drill.isFavourite).length;

    const renderItem = (item) => {
        const isSelected = selectedDrills.includes(item._id);

        return (
            <TouchableOpacity
                key={item._id}
                style={[
                    scheme === 'dark' ? styles.cardDark : styles.card,
                    isSelected && styles.selectedCard
                ]}
                onPress={() => router.push(`/drill-review/${item._id}`)}
                onLongPress={() => handleDrillLongPress(item)}
                activeOpacity={0.9}
                delayLongPress={2000}
            >
                <View style={{ position: 'relative' }}>
                    <Video
                        source={{ uri: item.url }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        isMuted
                        shouldPlay={false}
                        usePoster={!!item.thumbnailUrl}
                        posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
                    />
                    {selectMode && (
                        <View style={styles.selectionOverlay}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.heartIcon}
                        onPress={() => toggleFavorite(item._id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.heartText}>
                            {item.isFavourite ? '❤️' : '🤍'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={scheme === 'dark' ? styles.titleDark : styles.title}>{item.title}</Text>
                    {item.description && (
                        <Text style={scheme === 'dark' ? styles.descriptionDark : styles.description}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (!fontsLoaded || loading) {
        return (
            <View style={scheme === 'dark' ? styles.centeredDark : styles.centered}>
                <ActivityIndicator size="large" color={scheme === 'dark' ? '#8ab4f8' : '#1976d2'} />
            </View>
        );
    }

    return (
        <View style={scheme === 'dark' ? styles.containerDark : styles.container}>
            <CustomHeader
                title={selectMode ? `${selectedDrills.length} Selected` : "Training Drills"}
                onBackPress={() => {
                    if (selectMode) {
                        exitSelectMode();
                    } else if (showUploadForm) {
                        setShowUploadForm(false);
                        setDrillTitle('');
                        setDrillDescription('');
                        setSelectedVideo(null);
                    } else {
                        router.replace(role === 'coach' ? '/coach' : '/student');
                    }
                }}
            />

            {selectMode && (
                <TouchableOpacity
                    style={styles.trashButton}
                    onPress={handleDeleteSelected}
                    activeOpacity={0.8}
                    disabled={selectedDrills.length === 0 || deleting}
                >
                    {deleting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.trashButtonText}>🗑️ Delete ({selectedDrills.length})</Text>
                    )}
                </TouchableOpacity>
            )}

            {!selectMode && !showUploadForm && (
                <TouchableOpacity
                    style={styles.favoritesButton}
                    onPress={() => router.push('/favourites')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.favoritesButtonText}>❤️ {favoritesCount}</Text>
                </TouchableOpacity>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {showUploadForm ? (
                    <View style={scheme === 'dark' ? styles.uploadFormDark : styles.uploadForm}>
                        <Text style={scheme === 'dark' ? styles.formTitleDark : styles.formTitle}>
                            Upload New Drill
                        </Text>

                        <TextInput
                            style={scheme === 'dark' ? styles.inputDark : styles.input}
                            placeholder="Drill Title"
                            placeholderTextColor={scheme === 'dark' ? '#888' : '#666'}
                            value={drillTitle}
                            onChangeText={setDrillTitle}
                        />

                        <TextInput
                            style={[scheme === 'dark' ? styles.inputDark : styles.input, styles.textArea]}
                            placeholder="Drill Description (Optional)"
                            placeholderTextColor={scheme === 'dark' ? '#888' : '#666'}
                            value={drillDescription}
                            onChangeText={setDrillDescription}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={styles.videoPickerButton}
                            onPress={pickVideo}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.videoPickerText}>
                                {selectedVideo ? `Selected: ${selectedVideo.name}` : '📹 Select Video'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.formButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowUploadForm(false);
                                    setDrillTitle('');
                                    setDrillDescription('');
                                    setSelectedVideo(null);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.uploadButton, (!drillTitle.trim() || !selectedVideo) && styles.uploadButtonDisabled]}
                                onPress={handleUploadDrill}
                                activeOpacity={0.8}
                                disabled={!drillTitle.trim() || !selectedVideo || uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.uploadButtonText}>Upload Drill</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => setShowUploadForm(true)}
                            activeOpacity={0.8}
                            style={styles.newDrillContainer}
                            disabled={selectMode}
                        >
                            <LinearGradient
                                colors={selectMode ? ['#ccc', '#999'] : ['#8ab4f8', '#1976d2']}
                                style={styles.newDrill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.drillIcon}>🏏</Text>
                                <Text style={styles.drillText}>Upload New Drill</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.grid}>
                            {drills.length === 0 ? (
                                <Text style={scheme === 'dark' ? styles.emptyTextDark : styles.emptyText}>
                                    No drills yet. Upload your first drill!
                                </Text>
                            ) : (
                                drills.map(renderItem)
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8fb',
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#181c24',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f8fb',
    },
    centeredDark: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181c24',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    newDrillContainer: {
        marginBottom: 20,
    },
    newDrill: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    drillIcon: {
        fontSize: 36,
        marginBottom: 8,
        color: '#fff',
    },
    drillText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#fff',
    },
    favoritesButton: {
        position: 'absolute',
        top: 20,
        right: 16,
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    favoritesButtonText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },
    trashButton: {
        position: 'absolute',
        top: 20,
        right: 16,
        backgroundColor: '#ff4757',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    trashButtonText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },
    uploadForm: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    uploadFormDark: {
        backgroundColor: '#23243a',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: '#222f3e',
        marginBottom: 20,
        textAlign: 'center',
    },
    formTitleDark: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: '#f5f6fa',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
        color: '#222f3e',
    },
    inputDark: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 16,
        backgroundColor: '#2c2c2c',
        color: '#f5f6fa',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    videoPickerButton: {
        backgroundColor: '#1976d2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    videoPickerText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    formButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f1f2f6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    uploadButton: {
        flex: 1,
        backgroundColor: '#1976d2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    uploadButtonDisabled: {
        backgroundColor: '#ccc',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
    },
    cardDark: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: '#23243a',
        borderColor: '#333',
    },
    selectedCard: {
        borderColor: '#1976d2',
        borderWidth: 2,
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 8,
        backgroundColor: '#ccc',
    },
    selectionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    checkbox: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1976d2',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleContainer: {
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 0,
        position: 'relative',
    },
    heartIcon: {
        position: 'absolute',
        right: 5,
        top: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    heartText: {
        fontSize: 20,
    },
    title: {
        padding: 10,
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center',
        color: '#222f3e',
    },
    titleDark: {
        padding: 10,
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center',
        color: '#f5f6fa',
    },
    description: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        color: '#666',
    },
    descriptionDark: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        color: '#888',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingTop: 40,
        fontFamily: 'Poppins_400Regular',
        width: '100%',
        color: '#222f3e',
    },
    emptyTextDark: {
        fontSize: 16,
        textAlign: 'center',
        paddingTop: 40,
        fontFamily: 'Poppins_400Regular',
        width: '100%',
        color: '#f5f6fa',
    },
});