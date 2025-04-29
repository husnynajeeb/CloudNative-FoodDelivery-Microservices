import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // for copying to app storage
import axios from '../lib/axiosInstance';

export default function RegisterRestaurant() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    image: '', // image field
  });

  // Function to pick and save image into app storage
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied to access media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const pickedUri = result.assets[0].uri;
        const fileName = pickedUri.split('/').pop(); // get image file name
        const newPath = FileSystem.documentDirectory + fileName; // app's safe storage

        await FileSystem.copyAsync({
          from: pickedUri,
          to: newPath,
        });

        setForm({ ...form, image: newPath }); // save safe local path
      } catch (error) {
        console.log(error);
        alert('Failed to save image.');
      }
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://192.168.43.178:5000/api/auth/register/restaurant', form);
      alert('Registered successfully');
      router.replace('/');
    } catch (err) {
      console.log(err.response?.data);
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

      {/* Pick image button */}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Pick Restaurant Image</Text>
      </TouchableOpacity>

      {/* Show selected image preview */}
      {form.image ? (
        <Image source={{ uri: form.image }} style={styles.previewImage} />
      ) : null}

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
  input: { borderBottomWidth: 1, marginBottom: 12 },
  imageButton: { marginVertical: 10, backgroundColor: '#ddd', padding: 10, borderRadius: 8, alignItems: 'center' },
  imageButtonText: { fontSize: 16 },
  previewImage: { width: 100, height: 100, marginVertical: 10, borderRadius: 10, alignSelf: 'center' },
  link: { marginTop: 10, color: 'blue', textAlign: 'center' },
});
