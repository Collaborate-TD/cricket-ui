import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getCoaches } from '../services/api';
import { useRouter } from 'expo-router';
import { showAlert } from '../utils/alertMessage';

export default function CoachList() {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const res = await getCoaches();
                setCoaches(res.data);
            } catch (err) {
                showAlert('Error', 'Failed to fetch coaches');
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1976d2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack?.()) {
                        router.back();
                    } else {
                        router.replace('/student'); // or your desired fallback route
                    }
                }}
            >
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Coaches</Text>
            <FlatList
                data={coaches}
                keyExtractor={item => item._id || item.id}
                renderItem={({ item }) => (
                    <View style={styles.coachItem}>
                        <Text style={styles.coachName}>{item.firstName} {item.lastName}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text>No coaches found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 24 },
    backButton: { position: 'absolute', top: 40, left: 20, zIndex: 1 },
    backText: { fontSize: 32, color: '#1976d2' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    coachItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    coachName: { fontSize: 18 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});