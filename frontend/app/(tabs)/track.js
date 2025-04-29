import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import axios from '../../lib/axiosOrder'; // Your axios instance for order service
import useAuthStore from '../../store/authStore';

export default function TrackPage() {
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`/orders/customer/${user._id}/active`)
      .then(res => {
        setOrder(res.data.order);
        setDriver(res.data.driver);
      })
      .catch(err => {
        console.error('Failed to fetch active order:', err.message);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>No active orders to track 🛵</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🚚 Live Tracking</Text>

        <View style={styles.box}>
          <Text style={styles.label}>Restaurant:</Text>
          <Text style={styles.value}>{order.restaurantId}</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{order.status.toUpperCase()}</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>LKR {order.totalAmount.toFixed(2)}</Text>
        </View>

        {driver && (
          <View style={styles.box}>
            <Text style={styles.label}>Driver:</Text>
            <Text style={styles.value}>{driver.name} ({driver.phone})</Text>
          </View>
        )}

        <Text style={styles.message}>Your order is being delivered... 🍱</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111',
  },
  box: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#777',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  message: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16,
    color: '#444',
  },
});
