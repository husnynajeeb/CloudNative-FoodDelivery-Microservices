import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Lock } from 'lucide-react-native';
import axios from '../lib/axiosInstance';
import useAuthStore from '../store/authStore';
import Input from '../app/ui/Input';
import Button from '../app/ui/Button';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen'; // 👈 import

// 👇 prevent auto-hiding splash before app is ready
SplashScreen.preventAutoHideAsync();

export default function LoginScreen() {
  const { login, user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [appReady, setAppReady] = useState(false); // 👈 new state

  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  useEffect(() => {
    // ⏳ simulate loading delay or preload fonts here
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay
      setAppReady(true);
      SplashScreen.hideAsync(); // 👈 hide splash manually
    };

    prepare();
  }, []);

  useEffect(() => {
    if (user?.role === 'customer') {
      router.replace('/home');
    } else if (user?.role === 'restaurant') {
      router.replace('/menu');
    } else if (user?.role === 'admin') {
      router.replace('/dashboard/admin');
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/login', formData);
      const { token, user } = res.data;
      await login(token, user);
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!appReady) return null; // ⛔ Don't render UI until app is ready

  return (
    <StripeProvider publishableKey="pk_test_51REstHCtYURynd6PFDrmHpXkOCJrq2VLc8gYeL3VFjDO6wzblZ3Qr1Ur7D4RldEnoy4aobqQOMiFfrnR41U7VkI5000saCKGEG" >
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg' }}
            style={styles.backgroundImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, phone: text }));
              if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
            }}
            icon={<Phone size={20} color="#666" />}
            error={errors.phone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (errors.password) setErrors(prev => ({ ...prev, password: null }));
            }}
            icon={<Lock size={20} color="#666" />}
            showPasswordToggle
            secureTextEntry
            error={errors.password}
          />

          {errors.submit && (
            <Text style={styles.errorText}>{errors.submit}</Text>
          )}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => router.push('/register-customer')} 
            >
              <Text style={styles.registerButtonText}>Register as Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => router.push('/register-restaurant')}
            >
              <Text style={styles.registerButtonText}>Register as Restaurant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    height: 240,
    justifyContent: 'flex-end',
    padding: 20,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  form: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  loginButton: {
    marginTop: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  registerContainer: {
    marginTop: 40,
  },
  registerButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#3563E9',
    fontSize: 16,
    fontWeight: '600',
  },
});