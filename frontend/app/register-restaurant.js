import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from '../lib/axiosInstance';

export default function RegisterRestaurant() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: '', phone: '', address: '', email: '', password: '' });

  const handleRegister = async () => {
    try {
      await axios.post('/auth/register/restaurant', form);
      alert('Registered successfully');
      router.replace('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register as Restaurant</Text>
      {['businessName', 'phone', 'address', 'email', 'password'].map((field) => (
        <TextInput
          key={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          secureTextEntry={field === 'password'}
          style={styles.input}
          value={form[field]}
          onChangeText={(val) => setForm({ ...form, [field]: val })}
        />
      ))}
      <Button title="Register" onPress={handleRegister} />

      <Text style={styles.link} onPress={() => router.replace('/')}>
        Already have an account? Login here
      </Text>

      <Text style={styles.link} onPress={() => router.push('/register-customer')}>
        Want to register as a Customer?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 12 }
});
