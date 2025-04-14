import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function CustomerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name} 👋</Text>
      <Text style={styles.subtitle}>Role: {user?.role}</Text>

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 }
});
