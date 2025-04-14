import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from '../lib/axiosInstance';
import useAuthStore from '../store/authStore';

export default function LoginScreen() {
  const { login, user } = useAuthStore();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // 🔁 Redirect if already logged in
  useEffect(() => {
    if (user?.role === 'customer') {
      router.replace('/dashboard/customer');
    } else if (user?.role === 'restaurant') {
      router.replace('/dashboard/restaurant');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { phone, password });
      const { token, user } = res.data;
      await login(token, user);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => router.push('/register')}>
        Don't have an account? Register here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 12 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  link: { marginTop: 16, textAlign: 'center', color: 'blue' }
});
