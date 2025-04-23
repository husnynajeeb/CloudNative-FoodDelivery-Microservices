// screens/LoginDelivery.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from '../lib/axiosInstance';
import useAuthStore from '../store/authStore';

export default function LoginDelivery() {
  const { login, user } = useAuthStore();
  const navigation = useNavigation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user?.role === 'delivery') {
      Alert.alert('Welcome', 'Welcome to Driver Screen');
      navigation.replace('TrackDeliveryScreen');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { phone, password });
      const { token, user } = res.data;

      if (user.role !== 'delivery') {
        Alert.alert("Access Denied", "Only delivery partners can access this app.");
        return;
      }

      await login(token, user);
      
      // Show welcome alert right after successful login (if you want it here)
      Alert.alert('Welcome', 'Welcome to Driver Screen');
      navigation.replace('TrackDeliveryScreen');
      
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || 'Please check your credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery Login</Text>
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('RegisterDelivery')}>
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
