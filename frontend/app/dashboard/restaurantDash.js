import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function RestaurantDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  console.log(user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const goToViewMenu = () => router.push('/Screen/Menu/MenuListForm');
  const goToAddMenu = () => router.push('/Screen/Menu/AddMenuForm');
  const goToUpdateProfile = () => router.push('/Screen/Restaurant/UpdateProfile');
  const goToManageOrders = () => router.push('/Screen/Menu/ManageOrder');

  if (!user) {
    console.log('User is null or undefined');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    const { street = '', city = '', country = '' } = address;
    return [street, city, country].filter(Boolean).join(', ') || 'Address not available';
  };

  const isProfileIncomplete =
    !user.businessName || !user.address || !user.address?.street || !user.address?.city || !user.email || !user.phone;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{user.businessName || 'Restaurant Name Unavailable'}</Text>
        <Text style={styles.headerSubtitle}>Your Culinary Dashboard</Text>
      </View>

      <View style={styles.card}>
        {user.image ? (
          <Image source={{ uri: user.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Logo</Text>
          </View>
        )}

        <Text style={styles.welcomeText}>Welcome, Chef! 🍷</Text>

        {isProfileIncomplete && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Your profile is incomplete. Please update your restaurant details.
            </Text>
            <TouchableOpacity style={styles.updateProfileButton} onPress={goToUpdateProfile}>
              <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Business Name: </Text>
            {user.businessName || 'N/A'}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Phone: </Text>
            {user.phone || 'N/A'}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Email: </Text>
            {user.email || 'N/A'}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Address: </Text>
            {formatAddress(user.address)}
          </Text>
          {user.location?.coordinates && (
            <Text style={styles.detail}>
              <Text style={styles.detailLabel}>Location: </Text>
              {`Lat: ${user.location.coordinates[1]}, Lng: ${user.location.coordinates[0]}`}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.viewMenuButton} onPress={goToViewMenu}>
          <Text style={styles.buttonText}>View Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addMenuButton} onPress={goToAddMenu}>
          <Text style={styles.buttonText}>Add Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manageOrderButton} onPress={goToManageOrders}>
          <Text style={styles.buttonText}>Manage Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff9e6',
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#9b1d2a',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#f9e1a8',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
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
  image: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#f4c430',
    backgroundColor: '#f7f8fc',
  },
  placeholderImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#f7f8fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#f4c430',
  },
  placeholderText: {
    color: '#2d3436',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  warningContainer: {
    backgroundColor: '#fefcbf',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f6e05e',
  },
  warningText: {
    fontSize: 16,
    color: '#744210',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  updateProfileButton: {
    backgroundColor: '#d97706',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  detailsContainer: {
    backgroundColor: '#fffcf4',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f9e1a8',
  },
  detail: {
    fontSize: 17,
    color: '#2d3436',
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 24,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#9b1d2a',
  },
  viewMenuButton: {
    backgroundColor: '#b92b2b',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#b92b2b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  addMenuButton: {
    backgroundColor: '#2d8659',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2d8659',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  manageOrderButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: '#4a5568',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#4a5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loadingText: {
    fontSize: 18,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
});
