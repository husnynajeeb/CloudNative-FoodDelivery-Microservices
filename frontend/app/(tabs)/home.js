import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RestaurantCard from '../ui/RestaurantCard';
import axios from '../../lib/axiosOrder';
import { useRouter } from 'expo-router';
import { Bell, ShoppingCart } from 'lucide-react-native';
import useAuthStore from '../../store/authStore';
import * as Animatable from 'react-native-animatable'; // 👈 Added for animation

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    axios.get('/orders/restaurants-with-menus')
      .then(res => {
        setRestaurants(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filteredResults = restaurants.filter(r =>
      r.businessName.toLowerCase().startsWith(text.toLowerCase())
    );
    setFiltered(filteredResults);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user?.name || 'Guest'} 👋 </Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => {}}>
            <Bell size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')} style={{ marginLeft: 16 }}>
            <ShoppingCart size={22} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search Uber Eats"
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Animatable.View animation="fadeInUp" duration={400} key={item._id}>
            <RestaurantCard
              image="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg"
              name={item.businessName}
              onPress={() =>
                router.push({
                  pathname: `/restaurant/${item._id}`,
                  params: { name: item.businessName },
                })
              }
            />
          </Animatable.View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No restaurants found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    fontSize: 16,
    color: '#111',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});
