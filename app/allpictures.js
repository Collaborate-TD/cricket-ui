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

// Import local images
import cricdemo1 from '../assets/cricdemo1.jpeg';
import cricdemo2 from '../assets/cricdemo2.jpeg';

const dummyPictures = [
    { id: 1, source: cricdemo1, tag: 'demo' },
    { id: 2, source: cricdemo2, tag: 'warmup' },
    { id: 3, uri: 'https://via.placeholder.com/300x200.png?text=Drill+1', tag: 'drill' },
    { id: 4, uri: 'https://via.placeholder.com/300x200.png?text=Warmup+2', tag: 'warmup' },
    { id: 5, uri: 'https://via.placeholder.com/300x200.png?text=Selfie+3', tag: 'selfie' },
    { id: 6, uri: 'https://via.placeholder.com/300x200.png?text=Coach+4', tag: 'coach' },
    { id: 7, uri: 'https://via.placeholder.com/300x200.png?text=Drill+5', tag: 'drill' },
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
        const matchSearch = pic.uri
            ? pic.uri.toLowerCase().includes(search.toLowerCase())
            : true; // Always match if no uri (local image)
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
                {/* Search Input - Fixed Position */}
                <View style={stylesSet.searchContainer}>
                    <TextInput
                        placeholder="Search by keyword"
                        value={search}
                        onChangeText={setSearch}
                        style={stylesSet.searchInput}
                        placeholderTextColor={scheme === 'dark' ? '#aaa' : '#555'}
                    />
                </View>

                {/* Category Chips Scroll - Fixed Position */}
                <View style={stylesSet.categoryScrollContainer}>
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
                </View>

                {/* Pictures Scroll - Flexible Content Area */}
                <View style={stylesSet.picturesContainer}>
                    <ScrollView
                        contentContainerStyle={stylesSet.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredPictures.length === 0 ? (
                            <Text style={stylesSet.emptyText}>No pictures found.</Text>
                        ) : (
                            filteredPictures.map((pic) => (
                                <View key={pic.id} style={stylesSet.imageWrapper}>
                                    <Image
                                        source={pic.source ? pic.source : { uri: pic.uri }}
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
    searchContainer: {
        flexShrink: 0,
        marginBottom: 16,
    },
    searchInput: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        height: 48,
    },
    categoryScrollContainer: {
        flexShrink: 0,
        height: 50,
        marginBottom: 16,
    },
    categoryScroll: {
        flex: 1,
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        alignItems: 'center',
        height: 50,
    },
    picturesContainer: {
        flex: 1,
        minHeight: 0,
    },
    categoryChip: {
        minWidth: 70,
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 18,
        marginRight: 12,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
        flexGrow: 1,
    },
    imageWrapper: {
        marginBottom: 24,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    image: {
        width: '100%',
        height: 220,
    },
    tagContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 50,
        textAlign: 'center',
    },
};

const lightStyles = StyleSheet.create({
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: '#f8fafc',
    },
    searchInput: {
        ...baseStyles.searchInput,
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        color: '#1e293b',
    },
    categoryChip: {
        ...baseStyles.categoryChip,
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    categoryChipSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    categoryText: {
        ...baseStyles.categoryText,
        color: '#64748b',
    },
    categoryTextSelected: {
        color: '#ffffff',
    },
    tagContainer: {
        ...baseStyles.tagContainer,
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
    },
    emptyText: {
        ...baseStyles.emptyText,
        color: '#64748b',
    },
    imageWrapper: {
        ...baseStyles.imageWrapper,
        backgroundColor: '#ffffff',
    },
});

const darkStyles = StyleSheet.create({
    ...baseStyles,
    container: {
        ...baseStyles.container,
        backgroundColor: '#0f172a',
    },
    searchInput: {
        ...baseStyles.searchInput,
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        color: '#f1f5f9',
    },
    categoryChip: {
        ...baseStyles.categoryChip,
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    categoryChipSelected: {
        backgroundColor: '#60a5fa',
        borderColor: '#60a5fa',
    },
    categoryText: {
        ...baseStyles.categoryText,
        color: '#94a3b8',
    },
    categoryTextSelected: {
        color: '#0f172a',
    },
    tagContainer: {
        ...baseStyles.tagContainer,
        backgroundColor: 'rgba(96, 165, 250, 0.9)',
    },
    emptyText: {
        ...baseStyles.emptyText,
        color: '#94a3b8',
    },
    imageWrapper: {
        ...baseStyles.imageWrapper,
        backgroundColor: '#1e293b',
    },
});