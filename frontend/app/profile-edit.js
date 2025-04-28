import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '../store/authStore';
import axios from '../lib/axiosAuth'; // Make sure you have this axios instance for Auth service

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    try {
      const res = await axios.put(`/auth/update-profile`, formData); // Endpoint you must implement in auth backend
      console.log('✅ Profile updated:', res.data);

      updateUser(res.data.updatedUser); // Update local store
      router.replace('/profile'); // Go back to profile
    } catch (err) {
      console.error('❌ Failed to update profile:', err.message);
      alert('Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete('/auth/delete-profile'); // ✅ Delete profile
      logout(); // ✅ Clear token and user from store
      router.replace('/'); // ✅ Redirect to login page
    } catch (err) {
      console.error('❌ Failed to delete profile:', err.message);
      alert('Failed to delete account');
    }
  };  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.heading}>Edit Profile</Text>

        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput 
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#111',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#111',
  },
  saveButton: {
    backgroundColor: '#3E64FF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
