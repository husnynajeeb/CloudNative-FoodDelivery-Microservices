import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useAuthStore from '../../../store/authStore';

export default function ViewMenuForm() {
  const { id } = useLocalSearchParams();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = token || user?.token || user?.authToken;
      if (!authToken) {
        setMessage('Authentication token not found. Redirecting to login...');
        setTimeout(() => {
          router.replace('/Screen/Auth/Login');
        }, 2000);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [user, token, router]);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (authLoading || !id) return;

      try {
        const authToken = token || user?.token || user?.authToken;
        const res = await axios.get(`http://192.168.43.178:5002/api/restaurant-menu/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setMenuItem(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to fetch menu item.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id, authLoading, user, token]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b1a1a" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (message) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back to previous screen"
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b1a1a" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!menuItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Menu item not found. 🍽️</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back to previous screen"
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>View Menu Item</Text>
        <Text style={styles.headerSubtitle}>{menuItem.name}</Text>
      </View>

      <View style={styles.card}>
        {menuItem.image ? (
          <Image
            source={{ uri: `http://192.168.43.178:5002${menuItem.image}` }}
            style={styles.itemImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.detailContainer}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{menuItem.name}</Text>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{menuItem.description}</Text>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>Rs.{Number(menuItem.price).toFixed(2)}</Text>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{menuItem.category}</Text>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.label}>Availability:</Text>
          <Text style={[styles.value, { color: menuItem.isAvailable ? '#2d8659' : '#b91c1c', fontWeight: '600' }]}>
            {menuItem.isAvailable ? 'Available' : 'Not Available'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back to menu list"
        >
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff7e1',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#8b1a1a',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#f7d794',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f7d794',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f7f8fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f7d794',
  },
  placeholderText: {
    color: '#2d3436',
    fontSize: 16,
    fontWeight: '600',
  },
  detailContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
    backgroundColor: '#fffcf4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f7d794',
  },
  backButton: {
    backgroundColor: '#a82b2b',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#a82b2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 16,
  },
  backButtonError: {
    backgroundColor: '#4a5568',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#4a5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7e1',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4a5568',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7e1',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#b91c1c',
    marginBottom: 16,
    textAlign: 'center',
  },
});