import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from '../lib/axiosInstance';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'restaurant' is the other option

  const handleRegister = async () => {
    try {
      const res = await axios.post('/auth/register', {
        name,
        phone,
        email,
        password,
        role
      });
      if (res.status === 201) {
        alert('Registration successful!');
        router.replace('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <View style={styles.roleSwitch}>
        <Button title="Register as Customer" onPress={() => setRole('customer')} />
        <Button title="Register as Restaurant" onPress={() => setRole('restaurant')} />
      </View>

      <Text>Selected Role: {role}</Text>

      <Button title="Register" onPress={handleRegister} />
      <Text style={styles.link} onPress={() => router.replace('/')}>
        Already have an account? Login here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 12 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  roleSwitch: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  link: { marginTop: 16, textAlign: 'center', color: 'blue' }
});
