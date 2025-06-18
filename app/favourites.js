// FavouritePage.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { getFavourites, toggleFavourite } from '../services/api';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [viewType, setViewType] = useState('grid');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const user = jwtDecode(token);
      const res = await getFavourites(user.id);
      setFavourites(res.data);
      setFiltered(res.data);
    } catch (e) {
      console.error('Failed to fetch favourites:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredData = favourites.filter(item =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  const handleUnfavourite = async (id) => {
    await toggleFavourite(id); // toggle favourite in backend
    fetchFavourites();
  };

  const renderItem = ({ item }) => (
    <View style={viewType === 'list' ? styles.listCard : styles.card}>
      {item.type === 'video' ? (
        <Video
          source={{ uri: item.url }}
          style={styles.thumbnail}
          resizeMode="cover"
          isMuted
          shouldPlay={false}
        />
      ) : (
        <Image source={{ uri: item.url }} style={styles.thumbnail} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>Coach: {item.coachName}</Text>
        <Text style={styles.meta}>Date: {item.date}</Text>
        <Text style={styles.meta}>Tags: {item.tags?.join(', ') || 'None'}</Text>
        <Text style={styles.notes}>Note: {item.note || 'No notes added'}</Text>
        <TouchableOpacity onPress={() => handleUnfavourite(item._id)}>
          <Text style={styles.unfav}>❤️ Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Favourites</Text>
      <View style={styles.controls}>
        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search by title..."
          style={styles.search}
        />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Grid View</Text>
          <Switch
            value={viewType === 'grid'}
            onValueChange={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
          />
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't saved any favourites yet!</Text>
          <TouchableOpacity onPress={() => router.push('/all-videos')}>
            <Text style={styles.browseBtn}>Browse Videos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f4f8fb' 
  },
  backBtn: { 
    marginBottom: 12 
  },
  backText: { 
    fontSize: 16, 
    color: '#1976d2', 
    fontWeight: 'bold' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  controls: { 
    marginBottom: 16 
  },
  search: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  toggleRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  toggleLabel: { 
    marginRight: 8, 
    fontSize: 16 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  listCard: { 
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    flexDirection: 'row' 
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#ddd',
  },
  infoContainer: { 
    padding: 12 
  },
  title: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  meta: { 
    fontSize: 12, 
    color: '#777' 
  },
  notes: { 
    fontSize: 13, 
    marginVertical: 4 
  },
  unfav: { 
    color: '#d32f2f', 
    marginTop: 8 
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 16 
  },
  browseBtn: { 
    fontSize: 16, 
    color: '#1976d2' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  flatListContent: { 
    paddingBottom: 32 
  },
});