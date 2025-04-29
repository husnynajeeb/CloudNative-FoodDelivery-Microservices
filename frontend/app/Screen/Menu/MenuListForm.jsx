import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import useAuthStore from '../../../store/authStore';

const MenuListForm = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, token } = useAuthStore();

  const fetchMenuItems = async () => {
    try {
      const authToken = token || user?.token || user?.authToken;
      const res = await axios.get('http://192.168.43.178:5002/api/restaurant-menu/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMenuItems(res.data);
      console.log('Fetched menu items:', res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || err.overrideMessage || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user, token]);

  useFocusEffect(
    useCallback(() => {
      fetchMenuItems();
    }, [user, token])
  );

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const authToken = token || user?.token || user?.authToken;
              await axios.delete(`http://192.168.43.178:5002/api/restaurant-menu/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
              });
              setMenuItems(menuItems.filter(item => item._id !== id));
              Alert.alert('Success', 'Menu item deleted successfully');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.overrideMessage || 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.menuItem}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      )}
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>Rs.{Number(item.price).toFixed(2)}</Text>
        </View>
        
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemMeta}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <View style={[
            styles.availabilityBadge,
            item.isAvailable ? styles.available : styles.unavailable
          ]}>
            <Text style={styles.availabilityText}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        
        {item.ingredients && (
          <Text style={styles.itemIngredients}>
            <Text style={styles.metaLabel}>Ingredients: </Text>
            {item.ingredients}
          </Text>
        )}
        
        {item.allergens && (
          <Text style={styles.itemAllergens}>
            <Text style={styles.metaLabel}>Allergens: </Text>
            {item.allergens}
          </Text>
        )}
        
        {item.calories && (
          <Text style={styles.itemCalories}>
            <Text style={styles.metaLabel}>Calories: </Text>
            {item.calories}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton]}
            onPress={() => {
              console.log('Navigating to UpdateMenuForm with ID:', item._id);
              router.push(`/Screen/Menu/UpdateMenuForm?id=${item._id}`);
            }}
          >
            <Text style={styles.actionButtonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b1a1a" />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  if (message) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchMenuItems();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Items</Text>
        <Text style={styles.headerSubtitle}>{menuItems.length} items available</Text>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No menu items found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/Screen/Menu/AddMenuForm')}
            >
              <Text style={styles.addButtonText}>Add New Item</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7e1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7e1',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4a5568',
  },
  header: {
    padding: 20,
    backgroundColor: '#8b1a1a',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#f7d794',
    textAlign: 'center',
    marginTop: 5,
  },
  listContent: {
    padding: 10,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  itemImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b1a1a',
    marginLeft: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d8659',
    backgroundColor: '#e6f7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  available: {
    backgroundColor: '#e6f7ed',
  },
  unavailable: {
    backgroundColor: '#ffebee',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemIngredients: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 4,
  },
  itemAllergens: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 4,
  },
  itemCalories: {
    fontSize: 12,
    color: '#4a5568',
  },
  metaLabel: {
    fontWeight: 'bold',
    color: '#2d3436',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#8b1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: '#8b1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: '#2d8659',
  },
  deleteButton: {
    backgroundColor: '#b91c1c',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MenuListForm;