"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import axios from "../lib/axiosInstance"
import useAuthStore from "../store/authStore"
import { useNavigation } from "@react-navigation/native"
import { Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"

export default function DriverProfileScreen() {
  const { user, logout } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [authDetails, setAuthDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation()

  const BASE_IP = "192.168.1.3"

  useEffect(() => {
    fetchDriverProfile()
  }, [])

  const fetchDriverProfile = async () => {
    try {
      const deliveryRes = await axios.get(`http://${BASE_IP}:5004/api/delivery/authdriver/${user.id}`)
      setProfile(deliveryRes.data)

      const authRes = await axios.get(`http://${BASE_IP}:5000/api/auth/drivers/${user.id}`)
      setAuthDetails(authRes.data)
    } catch (err) {
      console.error("Error fetching driver profile:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async () => {
    if (!profile) return

    try {
      const newStatus = profile.status === "available" ? "busy" : "available"
      const res = await axios.patch(`http://${BASE_IP}:5004/api/delivery/delivery/status/${user.id}`, {
        status: newStatus,
      })
      setProfile(res.data)
    } catch (err) {
      console.error("Error updating status:", err.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginDelivery" }],
    })
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4a80f5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  if (!profile || !authDetails) {
    return (
      <View style={styles.loaderContainer}>
        <Feather name="alert-circle" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>Unable to load profile.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDriverProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <FontAwesome5 name="user-alt" size={40} color="#4a80f5" />
            </View>
            <View
              style={[
                styles.statusIndicator,
                profile.status === "available" ? styles.statusAvailable : styles.statusBusy,
              ]}
            />
          </View>

          <Text style={styles.heading}>{authDetails.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{profile.status === "available" ? "Available" : "Busy"}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <InfoRow icon="phone" label="Phone" value={authDetails.phone} />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <InfoRow icon="truck" label="Vehicle Type" value={authDetails.vehicleType || "Not Provided"} />

          <InfoRow icon="clipboard" label="Vehicle Plate" value={authDetails.vehiclePlate || "Not Provided"} />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.statusButton, profile.status === "available" ? styles.availableButton : styles.busyButton]}
            onPress={toggleAvailability}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={profile.status === "available" ? "do-not-disturb" : "check-circle"}
              size={22}
              color="#fff"
            />
            <Text style={styles.statusButtonText}>{profile.status === "available" ? "Go Busy" : "Go Available"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Feather name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelContainer}>
      <Feather name={icon} size={18} color="#4a80f5" style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6effd",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#f8f9fa",
  },
  statusAvailable: {
    backgroundColor: "#2ecc71",
  },
  statusBusy: {
    backgroundColor: "#e74c3c",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#e6effd",
    marginBottom: 20,
  },
  statusBadgeText: {
    color: "#4a80f5",
    fontWeight: "600",
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a80f5",
    marginBottom: 15,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontWeight: "500",
    fontSize: 15,
    color: "#555",
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  actionsContainer: {
    marginBottom: 30,
  },
  statusButton: {
    flexDirection: "row",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availableButton: {
    backgroundColor: "#e74c3c",
  },
  busyButton: {
    backgroundColor: "#2ecc71",
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: "#4a80f5",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#4a80f5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4a80f5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})
