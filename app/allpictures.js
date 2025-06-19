// AllPictures.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';

const dummyPictures = [
    { id: 1, uri: 'https://via.placeholder.com/300x200.png?text=Drill+1', tag: 'drill' },
    { id: 2, uri: 'https://via.placeholder.com/300x200.png?text=Warmup+2', tag: 'warmup' },
    { id: 3, uri: 'https://via.placeholder.com/300x200.png?text=Selfie+3', tag: 'selfie' },
    { id: 4, uri: 'https://via.placeholder.com/300x200.png?text=Coach+4', tag: 'coach' },
    { id: 5, uri: 'https://via.placeholder.com/300x200.png?text=Drill+5', tag: 'drill' },
];

const categories = ['All', 'Drill', 'Warmup', 'Selfie', 'Coach'];

export default function AllPictures() {
    const router = useRouter();
    const scheme = useColorScheme();
    const stylesSet = scheme === 'dark' ? darkStyles : lightStyles;

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [search, setSearch] = useState('');

    const filteredPictures = dummyPictures.filter((pic) => {
        const matchCategory =
            selectedCategory === 'All' || pic.tag.toLowerCase() === selectedCategory.toLowerCase();
        const matchSearch = pic.uri.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <View style={stylesSet.container}>
            {/* Custom Header */}
            <CustomHeader 
                title="Your Picture Gallery"
                onBackPress={() => router.back()}
                showBackButton={true}
                defaultRoute="/student"
            />

            <View style={stylesSet.content}>
                {/* Search Input */}
                <TextInput
                    placeholder="Search by keyword"
                    value={search}
                    onChangeText={setSearch}
                    style={stylesSet.searchInput}
                    placeholderTextColor={scheme === 'dark' ? '#aaa' : '#555'}
                />

                {/* Category Chips Scroll */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={stylesSet.categoryScroll}
                    contentContainerStyle={stylesSet.categoryContainer}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                stylesSet.categoryChip,
                                selectedCategory === cat && stylesSet.categoryChipSelected,
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    stylesSet.categoryText,
                                    selectedCategory === cat && stylesSet.categoryTextSelected,
                                ]}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Pictures Scroll */}
                <ScrollView contentContainerStyle={stylesSet.scrollContent}>
                    {filteredPictures.length === 0 ? (
                        <Text style={stylesSet.emptyText}>No pictures found.</Text>
                    ) : (
                        filteredPictures.map((pic) => (
                            <View key={pic.id} style={stylesSet.imageWrapper}>
                                <Image
                                    source={{ uri: pic.uri }}
                                    style={stylesSet.image}
                                    resizeMode="cover"
                                />
                                <View style={stylesSet.tagContainer}>
                                    <Text style={stylesSet.tagText}>{pic.tag.toUpperCase()}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const baseStyles = {
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    searchInput: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 14,
        borderWidth: 1,
    },
    categoryScroll: {
        marginBottom: 14,
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 4,
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    imageWrapper: {
        marginBottom: 20,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3, // shadow android
        shadowColor: '#000', // shadow ios
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    image: {
        width: '100%',
        height: 220,
    },
    tagContainer: {
        position: 'absolute',
        bottom: 8,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 50,
    },
};

const lightStyles = StyleSheet.create({
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: '#f7f9fc',
    },
    searchInput: {
        ...baseStyles.searchInput,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        color: '#222',
    },
    categoryChip: {
        ...baseStyles.categoryChip,
        backgroundColor: '#f0f0f0',
        borderColor: '#ddd',
    },
    categoryChipSelected: {
        backgroundColor: '#1976d2',
        borderColor: '#1976d2',
    },
    categoryText: {
        ...baseStyles.categoryText,
        color: '#555',
    },
    categoryTextSelected: {
        color: '#fff',
    },
    tagContainer: {
        ...baseStyles.tagContainer,
        backgroundColor: 'rgba(25, 118, 210, 0.8)',
    },
    emptyText: {
        ...baseStyles.emptyText,
        color: '#888',
    },
    imageWrapper: {
        ...baseStyles.imageWrapper,
        backgroundColor: '#fff',
    },
});

const darkStyles = StyleSheet.create({
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: '#12161f',
    },
    searchInput: {
        ...baseStyles.searchInput,
        backgroundColor: '#23243a',
        borderColor: '#444',
        color: '#eee',
    },
    categoryChip: {
        ...baseStyles.categoryChip,
        backgroundColor: '#333',
        borderColor: '#444',
    },
    categoryChipSelected: {
        backgroundColor: '#8ab4f8',
        borderColor: '#8ab4f8',
    },
    categoryText: {
        ...baseStyles.categoryText,
        color: '#aaa',
    },
    categoryTextSelected: {
        color: '#000',
    },
    tagContainer: {
        ...baseStyles.tagContainer,
        backgroundColor: 'rgba(138, 180, 248, 0.9)',
    },
    emptyText: {
        ...baseStyles.emptyText,
        color: '#aaa',
    },
    imageWrapper: {
        ...baseStyles.imageWrapper,
        backgroundColor: '#1f2233',
    },
});