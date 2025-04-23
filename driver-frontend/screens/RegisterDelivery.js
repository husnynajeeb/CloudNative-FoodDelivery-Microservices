// screens/RegisterDelivery.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from '../lib/axiosInstance'; // make sure path is correct

export default function RegisterDelivery() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Validation', 'Please fill in all required fields: Name, Phone, Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/register/driver', {
        name,
        phone,
        email,
        password,
        role: 'delivery', // Required by your backend
        vehicleType,
        vehiclePlate,
        address: '', // optional for now
        profilePicture: '', // optional default
        location: {
          type: 'Point',
          coordinates: [0, 0], // default coordinates
        },
      });

      if (res.status === 201) {
        Alert.alert('Success', 'Registration successful! Please login.');
        navigation.replace('LoginDelivery');
      }
    } catch (err) {
      console.log("Register Error:", err); // Log full error
      console.log("Error response:", err.response?.data); // Log backend response if available
      Alert.alert('Registration failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Delivery Driver Register</Text>

      <TextInput
        placeholder="Name*"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Phone*"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password*"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Vehicle Type"
        value={vehicleType}
        onChangeText={setVehicleType}
        style={styles.input}
      />
      <TextInput
        placeholder="Vehicle Plate"
        value={vehiclePlate}
        onChangeText={setVehiclePlate}
        style={styles.input}
        autoCapitalize="characters"
      />

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
      />

      <Text style={styles.link} onPress={() => navigation.navigate('LoginDelivery')}>
        Already have an account? Login
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    marginBottom: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  link: {
    marginTop: 24,
    textAlign: 'center',
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
