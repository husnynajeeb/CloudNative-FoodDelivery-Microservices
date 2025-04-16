// screens/LoginDelivery.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from '../lib/axiosInstance'; // make sure this path is inside your project folder
import useAuthStore from '../store/authStore'; // same for this

export default function LoginDelivery() {
  const { login, user } = useAuthStore();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user?.role === 'delivery') {
      Alert.alert('Welcome', 'Hi, Delivery Partner');
      navigation.replace('DeliveryScreen');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token, user } = res.data;
      if (user.role !== 'delivery') {
        Alert.alert("Access Denied", "This app is only for delivery partners.");
        return;
      }
      await login(token, user);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
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
