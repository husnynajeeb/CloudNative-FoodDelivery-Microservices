import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
//import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageOrders = () => {
  const navigation = useNavigation();
  const route = useRoute();
  console.log('ManageOrders route:', route); // Debug log

  const restaurantId = route?.params?.restaurantId || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!restaurantId) {
      alert('Restaurant ID not found. Please try again.');
      navigation.goBack();
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`http://192.168.43.178:5001/api/orders/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
      alert('Failed to fetch orders. Please try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://192.168.43.178:5001/api/orders/${orderId}`,
        { status: newStatus, restaurantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Order status updated successfully');
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const renderOrderItem = ({ item }) => {
    const statusOptions = ['pending', 'accepted', 'preparing', 'dispatched', 'delivered', 'cancelled'];

    return (
      <View style={styles.orderItem}>
        <Text style={styles.orderId}>Order ID: {item._id}</Text>
        <Text style={styles.customer}>
          Customer: {item.customer ? item.customer.name : 'Unknown'}
        </Text>
        <Text style={styles.customer}>
          Contact: {item.customer ? item.customer.phone : 'N/A'}
        </Text>
        <Text style={styles.sectionTitle}>Items:</Text>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.item}>
            <Text>
              {orderItem.menuDetails?.name || orderItem.name} x {orderItem.quantity}
            </Text>
            <Text>Price: ${orderItem.price}</Text>
          </View>
        ))}
        <Text style={styles.total}>Total Amount: ${item.totalAmount}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.sectionTitle}>Delivery Address:</Text>
        <Text>
          {item.deliveryAddress.street}, {item.deliveryAddress.city}, {item.deliveryAddress.country}
        </Text>
        <View style={styles.statusButtons}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.activeStatusButton,
              ]}
              onPress={() => updateStatus(item._id, status)}
              disabled={item.status === status}
            >
              <Text style={styles.statusButtonText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Orders</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noOrders: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    flex: 1,
  },
  orderItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customer: {
    fontSize: 14,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  item: {
    paddingLeft: 10,
    marginBottom: 5,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    marginTop: 5,
    color: '#2ecc71',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  statusButton: {
    backgroundColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  activeStatusButton: {
    backgroundColor: '#3498db',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default ManageOrders;