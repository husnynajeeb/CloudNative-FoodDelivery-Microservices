import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function CustomerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        console.log('Fetching active order for user id:', user.id);
        const res = await axios.get(`http://192.168.106.55:5001/api/orders/customer/${user.id}/active`);
        console.log('Order response:', res.data);
        setActiveOrder(res.data.order);
      } catch (err) {
        console.log('No active order:', err.message);
        setActiveOrder(null);
      }
    };

    if (user?.id) {
      fetchActiveOrder();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleTrackDelivery = () => {
    if (!activeOrder) return;

    const orderId = activeOrder._id || activeOrder.id;
    router.push(`/dashboard/customer-track?orderId=${orderId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name} 👋</Text>
      <Text style={styles.subtitle}>Role: {user?.role}</Text>

      {activeOrder?.status === 'dispatched' && (
        <Button title="Track Delivery" onPress={handleTrackDelivery} />
      )}

      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
});
