// screens/RegisterDelivery.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from '../lib/axiosInstance'; // update path accordingly

export default function RegisterDelivery() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const handleRegister = async () => {
    try {
      const res = await axios.post('/auth/register', {
        name,
        phone,
        email,
        password,
        role: 'delivery',
        vehicleType,
        vehiclePlate
      });

      if (res.status === 201) {
        alert('Delivery registration successful!');
        navigation.replace('LoginDelivery');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery Driver Register</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput placeholder="Vehicle Type" value={vehicleType} onChangeText={setVehicleType} style={styles.input} />
      <TextInput placeholder="Vehicle Plate" value={vehiclePlate} onChangeText={setVehiclePlate} style={styles.input} />

      <Button title="Register" onPress={handleRegister} />
      <Text style={styles.link} onPress={() => navigation.navigate('LoginDelivery')}>Already have an account? Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 12 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  link: { marginTop: 16, textAlign: 'center', color: 'blue' }
});
