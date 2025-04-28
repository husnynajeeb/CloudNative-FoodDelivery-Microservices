import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

export default function RestaurantDashboard() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
 console.log(token);
 console.log(user);
  useEffect(() => {
    if (!user || user.role !== 'restaurant') {
      router.replace('/');
    } else {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://192.168.106.55:5002/api/restaurant-menu/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);

      if (error.response?.status === 401 || error.response?.data?.name === 'TokenExpiredError') {
        Alert.alert('Session Expired', 'Please login again.');
        await logout();
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.patch(
        `http://192.168.106.55:5002/api/restaurant-menu/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Success', 'Order status updated!');
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating order:', error.response?.data || error.message);

      if (error.response?.status === 401 || error.response?.data?.name === 'TokenExpiredError') {
        Alert.alert('Session Expired', 'Please login again.');
        await logout();
        router.replace('/');
      } else {
        Alert.alert('Error', 'Failed to update order status');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>Order ID: {item._id}</Text>
      <Text style={styles.deliveryAddress}>
        {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
      </Text>
      <Text style={styles.totalAmount}>Total: ${item.totalAmount}</Text>
      <Text style={styles.status}>Status: {capitalizeFirstLetter(item.status)}</Text>

      <FlatList
        data={item.items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Text style={styles.item}>• {item.name} x {item.quantity}</Text>
        )}
      />

      {/* Only show button if status is pending, accepted, or preparing */}
      {['pending', 'accepted', 'preparing'].includes(item.status) && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => updateOrderStatus(item._id, 'dispatched')}
          disabled={updatingOrderId === item._id}
        >
          <Text style={styles.updateButtonText}>
            {updatingOrderId === item._id ? 'Updating...' : 'Mark as Dispatched'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3563E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Pending Orders</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.noOrders}>
          <Text>No pending orders yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3563E9',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  orderId: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  deliveryAddress: {
    fontSize: 14,
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  status: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  item: {
    fontSize: 14,
    marginLeft: 10,
  },
  updateButton: {
    marginTop: 10,
    backgroundColor: '#3563E9',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrders: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
