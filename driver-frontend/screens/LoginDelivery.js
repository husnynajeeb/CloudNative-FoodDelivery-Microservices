import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image } from 'react-native';
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
      navigation.replace('DriverTabs');
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
      navigation.replace('DriverTabs');
      
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || 'Please check your credentials');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://static.vecteezy.com/system/resources/thumbnails/004/975/153/small_2x/driver-color-icon-transportation-service-isolated-illustration-vector.jpg' }} 
          style={styles.logo} 
        />
      </View>
      <Text style={styles.heading}>Driver Login</Text>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            placeholder="Enter your phone number" 
            value={phone} 
            onChangeText={setPhone} 
            style={styles.input} 
            keyboardType="phone-pad" 
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            placeholder="Enter your password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            style={styles.input} 
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <Text style={styles.link} onPress={() => navigation.navigate('RegisterDelivery')}>
          Don't have an account? <Text style={styles.linkHighlight}>Register here</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    borderRadius: 75
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#555'
  },
  input: { 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  heading: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  button: {
    backgroundColor: '#4a80f5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: { 
    marginTop: 20, 
    textAlign: 'center', 
    color: '#666',
    fontSize: 14
  },
  linkHighlight: {
    color: '#4a80f5',
    fontWeight: 'bold'
  }
});