import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import axios from '../../lib/axiosRestaurant';
import MenuItemCard from '../ui/MenuItemCard';
import StickyMiniHeader from '../ui/StickyMiniHeader';
import useCartStore from '../../store/cartStore'; // ✅ Import cart store

export default function RestaurantScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);

  const { cartItems, addToCart } = useCartStore(); // ✅ Fix import properly

  useEffect(() => {
    if (id) {
      axios.get(`/restaurant-menu/restaurant/${id}`)
        .then(res => {
          setRestaurant({
            _id: id,
            businessName: name,
            menu: res.data
          });
        })
        .catch(err => console.error('Failed to fetch restaurant', err));
    }
  }, [id]);

  const handleAddItem = (item) => {
    if (!restaurant) return;

    addToCart(item, {
      id: restaurant._id,
      name: restaurant.businessName
    });
  };

  if (!restaurant) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StickyMiniHeader title={restaurant.businessName} />

      <ScrollView>
        {/* Header Section */}
        <View style={styles.topSection}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg' }} 
            style={styles.image}
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.businessName}</Text>
            <Text style={styles.deliveryInfo}>LKR 44 Delivery Fee • 15 min</Text>
            <Text style={styles.reorderTag}>1000+ people reordered</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Picked for you</Text>
          {restaurant.menu.map((item) => (
            <MenuItemCard 
              key={item._id} 
              item={item} 
              onAdd={() => handleAddItem(item)}  // ✅ Pass handleAddItem to MenuItemCard
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingCartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.cartButtonText}>View Cart ({cartItems.length}) ➔</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  deliveryInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  reorderTag: {
    backgroundColor: '#d1fae5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    color: '#065f46',
    fontSize: 13,
    fontWeight: '500',
  },
  menuSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },  
});
