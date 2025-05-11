import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular as Poppins_Regular,
  Poppins_500Medium as Poppins_Medium,
  Poppins_600SemiBold as Poppins_SemiBold,
} from '@expo-google-fonts/poppins';
import { ChevronLeft, Phone, Mail, Lock, Building2, MapPin } from 'lucide-react-native';
import axios from '../lib/axiosInstance';
import theme from '../app/constants/theme';
import FormInput from '../app/ui/Input';
import Button from '../app/ui/Button';
import LinkText from '../app/ui/LinkText';
import ProgressBar from '../app/ui/ProgressBar';
import KeyboardAvoidingWrapper from '../app/ui/KeyboardAvoidingWrapper';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RegisterRestaurant() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    street: '',
    city: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 6;

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_Regular,
    'Poppins-Medium': Poppins_Medium,
    'Poppins-SemiBold': Poppins_SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const getProgress = () => {
    const fieldsCompleted = Object.values(form).filter(value => value.trim() !== '').length;
    return fieldsCompleted / totalSteps;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.businessName) newErrors.businessName = 'Business name is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!form.street) newErrors.street = 'Street is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        businessName: form.businessName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        address: {
          street: form.street,
          city: form.city,
        },
      };
      await axios.post('/auth/register/restaurant', payload);
      setIsLoading(false);
      router.replace('/');
    } catch (err) {
      setIsLoading(false);
      console.error('❌ Registration failed:', err.message);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const getFieldIcon = (field) => {
    switch (field) {
      case 'businessName': return <Building2 size={20} color={theme.colors.icon} />;
      case 'phone': return <Phone size={20} color={theme.colors.icon} />;
      case 'email': return <Mail size={20} color={theme.colors.icon} />;
      case 'password': return <Lock size={20} color={theme.colors.icon} />;
      case 'street':
      case 'city': return <MapPin size={20} color={theme.colors.icon} />;
      default: return null;
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'businessName': return 'Business Name';
      case 'phone': return 'Phone Number';
      case 'email': return 'Email Address';
      case 'password': return 'Password';
      case 'street': return 'Street';
      case 'city': return 'City';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  const getKeyboardType = (field) => {
    if (field === 'email') return 'email-address';
    if (field === 'phone') return 'phone-pad';
    return 'default';
  };

  return (
    <KeyboardAvoidingWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Restaurant</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{Math.round(getProgress() * 100)}% Complete</Text>
        <ProgressBar progress={getProgress()} />
      </View>

      <Text style={styles.subtitle}>
        Provide your business information to get started as a restaurant.
      </Text>

      <View style={styles.formContainer}>
        {Object.keys(form).map((field) => (
          <FormInput
            key={field}
            label={getFieldLabel(field)}
            secureTextEntry={field === 'password'}
            value={form[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            error={errors[field]}
            autoCapitalize={field === 'businessName' ? 'words' : 'none'}
            keyboardType={getKeyboardType(field)}
            leftIcon={getFieldIcon(field)}
          />
        ))}

        <Button
          title="Create Account"
          onPress={handleRegister}
          isLoading={isLoading}
          fullWidth
          style={styles.registerButton}
        />

        <View style={styles.loginLinkContainer}>
          <Text style={styles.linkText}>Already have an account?</Text>
          <LinkText text="Sign In" onPress={() => router.replace('/')} style={styles.loginLink} />
        </View>

        <TouchableOpacity
          style={styles.restaurantLink}
          onPress={() => router.push('/register-customer')}
        >
          <Text style={styles.restaurantLinkText}>Want to register as a Customer?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: theme.colors.text,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: theme.colors.secondaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: theme.colors.secondaryText,
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  registerButton: {
    marginTop: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  loginLink: {
    marginLeft: 4,
    fontSize: 14,
  },
  restaurantLink: {
    marginTop: 32,
    padding: 16,
    backgroundColor: theme.colors.buttonSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  restaurantLinkText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
});
