"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from "react-native"
import useAuthStore from "../../store/authStore"
import { useRouter } from "expo-router"
import axios from "axios"
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
 const BASE_IP = "192.168.1.3"

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
        const res = await axios.get(`http://${BASE_IP}:5001/api/orders/customer/${user.id}/active`)
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF9800"
      case "accepted":
        return "#2196F3"
      case "preparing":
        return "#9C27B0"
      case "dispatched":
        return "#4CAF50"
      default:
        return "#757575"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Feather name="clock" size={16} color="#FF9800" />
      case "accepted":
        return <Feather name="check-circle" size={16} color="#2196F3" />
      case "preparing":
        return <MaterialIcons name="restaurant" size={16} color="#9C27B0" />
      case "dispatched":
        return <Feather name="truck" size={16} color="#4CAF50" />
      default:
        return <Feather name="help-circle" size={16} color="#757575" />
    }
  }

  const capitalizeFirstLetter = (string) => {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={["#3563E9", "#3563E9"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || "Customer"}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Feather name="log-out" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={24} color="#3563E9" />
            </View>
            <Text style={styles.title}>Track Your Orders</Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.roleBadgeContainer}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role}</Text>
              </View>
            </View>

            <View style={styles.orderCard}>
              <LinearGradient
                colors={["#F8F9FF", "#F1F4FF"]}
                style={styles.orderHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.orderHeaderLeft}>
                  <Text style={styles.orderId}>Active Order</Text>
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusBadgeText}>LIVE</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.orderContent}>
                {loading ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#3563E9" />
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
                      <View style={styles.statusContainer}>
                        {getStatusIcon(activeOrder.status)}
                        <Text style={[styles.statusText, { color: getStatusColor(activeOrder.status) }]}>
                          {capitalizeFirstLetter(activeOrder.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {["dispatched", "out_for_delivery"].includes(activeOrder?.status) ?(
                      <TouchableOpacity style={styles.trackButton} onPress={handleTrackDelivery}>
                        <MaterialIcons name="location-on" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.trackButtonText}>Track Delivery</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.processingContainer}>
                        <Feather name="clock" size={18} color="#FF9800" style={{ marginRight: 8 }} />
                        <Text style={styles.processingText}>Your order is being prepared</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.noOrderContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Feather name="package" size={40} color="#BDBDBD" />
                    </View>
                    <Text style={styles.noOrdersTitle}>No Active Orders</Text>
                    <Text style={styles.noOrdersText}>Your active orders will appear here</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.footerNote}>Track your orders in real-time and get live updates on your delivery</Text>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3563E9",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#F5F7FF",
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(53, 99, 233, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1D1F",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roleBadgeContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  roleBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderHeaderLeft: {
    flexDirection: "column",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D1F",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadgeText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "700",
  },
  orderContent: {
    padding: 16,
  },
  loaderContainer: {
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    color: "#757575",
    fontSize: 14,
  },
  orderDetails: {
    gap: 16,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: "#757575",
  },
  orderValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1D1F",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  trackButton: {
    backgroundColor: "#3563E9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    marginTop: 8,
  },
  processingText: {
    color: "#FF9800",
    fontWeight: "500",
    fontSize: 14,
  },
  noOrderContainer: {
    alignItems: "center",
    padding: 30,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noOrdersTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  noOrdersText: {
    color: "#757575",
    fontSize: 14,
    textAlign: "center",
  },
  footerNote: {
    textAlign: "center",
    color: "#9E9E9E",
    fontSize: 13,
    marginTop: 20,
    fontStyle: "italic",
    marginBottom: 30,
  },
})