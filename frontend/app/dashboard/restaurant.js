import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function RestaurantDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/'); // Navigate to login page
  };

  const goToViewMenu = () => {
    router.push('/Screen/Menu/MenuListForm'); // Navigate to ViewMenuForm
  };

  const goToAddMenu = () => {
    router.push('/Screen/Menu/AddMenuForm'); // Navigate to AddMenuForm
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{user.businessName}</Text>
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

        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Phone: </Text>{user.phone}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Email: </Text>{user.email}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Address: </Text>{user.address}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.detailLabel}>Role: </Text>{user.role}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewMenuButton}
          onPress={goToViewMenu}
          activeOpacity={0.7}
          accessibilityLabel="View restaurant menu"
        >
          <Text style={styles.buttonText}>View Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addMenuButton}
          onPress={goToAddMenu}
          activeOpacity={0.7}
          accessibilityLabel="Add new menu item"
        >
          <Text style={styles.buttonText}>Add Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityLabel="Sign out of account"
        >
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
    backgroundColor: '#2d8659', // Green for "add" action to differentiate
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