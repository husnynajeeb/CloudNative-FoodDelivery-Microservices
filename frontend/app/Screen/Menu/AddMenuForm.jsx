import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../../store/authStore';

export default function AddMenuForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    image: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = token || user?.token || user?.authToken;
      if (!authToken) {
        setMessage('Authentication token not found. Redirecting to login...');
        setTimeout(() => {
          router.replace('/Screen/Auth/Login');
        }, 2000);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [user, token, router]);

  const selectImage = async () => {
    console.log('Requesting gallery permission');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setMessage('Permission to access gallery was denied');
      console.log('Permission denied');
      return;
    }

    console.log('Opening image picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    console.log('Picker result:', result);
    if (!result.canceled && result.assets && result.assets[0]) {
      console.log('Selected image:', result.assets[0]);
      setFormData((prev) => ({
        ...prev,
        image: result.assets[0]
      }));
    } else if (result.canceled) {
      console.log('User cancelled image picker');
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setMessage('Please fill in all required fields (image is optional).');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const authToken = token || user?.token || user?.authToken;
      if (!authToken) {
        setMessage('Authentication token not found. Redirecting to login...');
        setTimeout(() => {
          router.replace('/Screen/Auth/Login');
        }, 2000);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isAvailable', formData.isAvailable.toString());

      if (formData.image) {
        formDataToSend.append('image', {
          uri: formData.image.uri,
          type: formData.image.mimeType || 'image/jpeg',
          name: formData.image.fileName || 'image.jpg'
        });
      }

      const response = await axios.post(
        'http://192.168.43.178:5002/api/restaurant-menu',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage(response.data.message || 'Menu item added successfully! 🍽️');
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true,
        image: null
      });

      setTimeout(() => {
        const newItemId = response.data.data._id;
        router.push(`/dashboard/restaurantDash`);
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || 'Failed to add menu item.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b1a1a" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Menu Item</Text>
        <Text style={styles.headerSubtitle}>Create a New Culinary Delight</Text>
      </View>

      <View style={styles.formCard}>
        {message ? (
          <Text style={[styles.message, { color: message.includes('successfully') ? '#2d8659' : '#b91c1c' }]}>
            {message}
          </Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            placeholderTextColor="#a3a3a3"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            required
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the dish"
            placeholderTextColor="#a3a3a3"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
            numberOfLines={4}
            required
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price (e.g., 12.99)"
            placeholderTextColor="#a3a3a3"
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
            keyboardType="numeric"
            required
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category (Main, Drinks, Dessert, Other)"
            placeholderTextColor="#a3a3a3"
            value={formData.category}
            onChangeText={(text) => handleChange('category', text)}
            required
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image (Optional)</Text>
          <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
            <Text style={styles.imageButtonText}>
              {formData.image ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>
          {formData.image && (
            <Image
              source={{ uri: formData.image.uri }}
              style={styles.previewImage}
            />
          )}
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Available</Text>
          <Switch
            value={formData.isAvailable}
            onValueChange={(value) => handleChange('isAvailable', value)}
            trackColor={{ false: '#d1d5db', true: '#8b1a1a' }}
            thumbColor={formData.isAvailable ? '#f4c430' : '#f4f4f5'}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
          accessibilityLabel="Add menu item and view details"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Add Item</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff7e1',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#8b1a1a',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#f7d794',
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fffcf4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2d3436',
    borderWidth: 1,
    borderColor: '#f7d794',
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#2d8659',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f7d794',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#a82b2b',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#a82b2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    shadowColor: '#d1d5db',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7e1',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4a5568',
    marginTop: 12,
  },
});