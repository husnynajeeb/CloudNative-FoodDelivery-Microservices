"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import useAuthStore from "../../store/authStore"
import { useRouter } from "expo-router"
import axios from "axios"
import { Feather, MaterialIcons } from "@expo/vector-icons"

export default function CustomerDashboard() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        console.log("Fetching active order for user id:", user.id)
        setLoading(true)
        const res = await axios.get(`http://192.168.106.55:5001/api/orders/customer/${user.id}/active`)
        console.log("Order response:", res.data)
        setActiveOrder(res.data.order)
      } catch (err) {
        console.log("No active order:", err.message)
        setActiveOrder(null)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchActiveOrder()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.replace("/")
  }

  const handleTrackDelivery = () => {
    if (!activeOrder) return

    const orderId = activeOrder._id || activeOrder.id
    router.push(`/dashboard/customer-track?orderId=${orderId}`)
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "Customer"} 👋</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#FF5252" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Active Order Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Order</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200EE" />
              <Text style={styles.loadingText}>Checking for active orders...</Text>
            </View>
          ) : activeOrder ? (
            <View style={styles.orderDetails}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderLabel}>Order ID:</Text>
                <Text style={styles.orderValue}>#{activeOrder._id || activeOrder.id}</Text>
              </View>

              <View style={styles.orderInfo}>
                <Text style={styles.orderLabel}>Status:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    activeOrder.status === "dispatched" ? styles.dispatchedBadge : styles.processingBadge,
                  ]}
                >
                  <Text style={styles.statusText}>{activeOrder.status}</Text>
                </View>
              </View>

              {activeOrder?.status === "dispatched" && (
                <TouchableOpacity style={styles.trackButton} onPress={handleTrackDelivery}>
                  <MaterialIcons name="location-on" size={18} color="#fff" />
                  <Text style={styles.trackButtonText}>Track Delivery</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noOrderContainer}>
              <Feather name="package" size={48} color="#BDBDBD" />
              <Text style={styles.noOrderText}>No active orders found</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/dashboard/order-history")}>
              <Feather name="clock" size={24} color="#6200EE" />
              <Text style={styles.actionText}>Order History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/dashboard/profile")}>
              <Feather name="user" size={24} color="#6200EE" />
              <Text style={styles.actionText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/dashboard/support")}>
              <Feather name="help-circle" size={24} color="#6200EE" />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#757575",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  logoutText: {
    marginLeft: 4,
    color: "#FF5252",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#212121",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#757575",
  },
  orderDetails: {
    gap: 12,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderLabel: {
    fontSize: 14,
    color: "#757575",
  },
  orderValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212121",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dispatchedBadge: {
    backgroundColor: "#E3F2FD",
  },
  processingBadge: {
    backgroundColor: "#FFF8E1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
    textTransform: "capitalize",
  },
  trackButton: {
    backgroundColor: "#6200EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  noOrderContainer: {
    alignItems: "center",
    padding: 24,
  },
  noOrderText: {
    marginTop: 12,
    color: "#757575",
    fontSize: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    width: "30%",
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: "#424242",
    textAlign: "center",
  },
})
