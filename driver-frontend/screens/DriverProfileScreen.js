import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity 
} from 'react-native';
import axios from '../lib/axiosInstance';
import useAuthStore from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

export default function DriverProfileScreen() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [authDetails, setAuthDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      const deliveryRes = await axios.get(`http://192.168.106.55:5003/api/delivery/authdriver/${user.id}`);
      setProfile(deliveryRes.data);

      const authRes = await axios.get(`http://192.168.106.55:5000/api/auth/drivers/${user.id}`);
      setAuthDetails(authRes.data);
    } catch (err) {
      console.error('Error fetching driver profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!profile) return;

    try {
      const newStatus = profile.status === 'available' ? 'busy' : 'available';
      const res = await axios.patch(`http://192.168.106.55:5003/api/delivery/delivery/status/${user.id}`, { status: newStatus });
      setProfile(res.data);
    } catch (err) {
      console.error('Error updating status:', err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginDelivery' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!profile || !authDetails) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ fontSize: 16, color: '#666' }}>Unable to load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Profile</Text>

      <View style={styles.infoBox}>
        <InfoRow label="Name" value={authDetails.name} />
        <InfoRow label="Phone" value={authDetails.phone} />
        <InfoRow label="Vehicle Type" value={authDetails.vehicleType || "Not Provided"} />
        <InfoRow label="Vehicle Plate" value={authDetails.vehiclePlate || "Not Provided"} />
        <InfoRow label="Current Status" value={profile.status} />
      </View>

      <TouchableOpacity
        style={[
          styles.statusButton,
          profile.status === 'available' ? styles.available : styles.busy,
        ]}
        onPress={toggleAvailability}
        activeOpacity={0.8}
      >
        <Text style={styles.statusButtonText}>
          {profile.status === 'available' ? 'Go Busy' : 'Go Available'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f5',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 25,
    alignSelf: 'center',
    textShadowColor: '#a0a0a0',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoLabel: {
    fontWeight: '600',
    width: 150,
    fontSize: 16,
    color: '#34495e',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  statusButton: {
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  available: {
    backgroundColor: '#27ae60',
  },
  busy: {
    backgroundColor: '#c0392b',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#34495e',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#ecf0f1',
    fontWeight: '700',
    fontSize: 18,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
