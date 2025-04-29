import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Switch, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Image
} from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../../store/authStore';

const UpdateMenuForm = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    image: null // Stores image object or server path
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const authToken = token || user?.token || user?.authToken;
      if (!authToken) {
        setMessage('Authentication token not found. Redirecting to login...');
        setTimeout(() => {
          router.replace('/Screen/Auth/Login');
        }, 2000);
        setAuthLoading(false);
        return;
      }

      if (!id) {
        setMessage('No menu item ID provided. Please select a valid menu item.');
        setAuthLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://192.168.43.178:5002/api/restaurant-menu/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const newFormData = {
          name: response.data.name || '',
          description: response.data.description || '',
          price: response.data.price?.toString() || '',
          category: response.data.category || '',
          isAvailable: response.data.isAvailable !== undefined ? response.data.isAvailable : true,
          image: response.data.image ? `http://192.168.43.178:5002${response.data.image}` : null
        };
        setFormData(newFormData);
      } catch (err) {
        const status = err.response?.status;
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch menu item';
        if (status === 404) {
          setMessage('Menu item not found. It may have been deleted or doesn’t exist.');
        } else {
          setMessage(`Error: ${errorMessage} (Status: ${status || 'N/A'})`);
        }
      } finally {
        setLoading(false);
        setAuthLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [id, user, token, router]);

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

      if (formData.image && typeof formData.image === 'object') {
        formDataToSend.append('image', {
          uri: formData.image.uri,
          type: formData.image.mimeType || 'image/jpeg',
          name: formData.image.fileName || 'image.jpg'
        });
      }

      const response = await axios.patch(
        `http://192.168.43.178:5002/api/restaurant-menu/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage(response.data.message || 'Menu item updated successfully! 🍽️');
      setTimeout(() => {
        router.push('/Screen/Menu/MenuListForm');
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update menu item';
      setMessage(`Error: ${errorMessage} (Status: ${err.response?.status || 'N/A'})`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setMessage('');
    setLoading(true);
    setAuthLoading(true);
    checkAuthAndFetch();
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b1a1a" />
        <Text style={styles.loadingText}>
          {authLoading ? 'Checking authentication...' : 'Loading menu item...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Update Menu Item</Text>
        <Text style={styles.headerSubtitle}>Edit Your Culinary Delight</Text>
      </View>

      <View style={styles.formCard}>
        {message ? (
          <View style={styles.messageContainer}>
            <Text style={[styles.message, { color: message.includes('successfully') ? '#2d8659' : '#b91c1c' }]}>
              {message}
            </Text>
            {message.includes('Error') || message.includes('not found') || message.includes('No menu item ID') ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Text style={styles.backButtonText}>Back to Menu</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
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
              source={{ uri: typeof formData.image === 'string' ? formData.image : formData.image.uri }}
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
          accessibilityLabel="Update menu item and view details"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Update Item</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
  messageContainer: {
    alignItems: 'center',
    width: '100%',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#8b1a1a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#4a5568',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
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

export default UpdateMenuForm;