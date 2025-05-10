"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native"
import { useRouter } from "expo-router"
import axios from "axios"
import useAuthStore from "../../../store/authStore"
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const BASE_IP = "192.168.106.55"

export default function RestaurantDashboard() {
  const { user, token, logout } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "restaurant") {
      router.replace("/")
    } else {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://${BASE_IP}:5002/api/restaurant-menu/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrders(res.data)
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message)

      if (error.response?.status === 401 || error.response?.data?.name === "TokenExpiredError") {
        Alert.alert("Session Expired", "Please login again.")
        await logout()
        router.replace("/login")
      } else {
        Alert.alert("Error", "Failed to fetch orders")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/")
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

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <LinearGradient
        colors={["#FFEB3B", "#FF9800"]}
        style={styles.orderHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{capitalizeFirstLetter(item.status)}</Text>
          </View>
        </View>
        <View style={[styles.priceBadge, { backgroundColor: getStatusColor(item.status) + "20" }]} >
          <Text style={[styles.priceText, { color: getStatusColor(item.status) }]}>${item.totalAmount}</Text>
        </View>
      </LinearGradient>

      <View style={styles.orderContent}>
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={18} color="#757575" style={styles.addressIcon} />
          <Text style={styles.deliveryAddress}>
            {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.itemsTitle}>Order Items:</Text>
        <FlatList
          data={item.items}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.itemDot} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  )

  const capitalizeFirstLetter = (string) => {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3563E9" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={["#E91E63", "#F44336"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.restaurantName}>{user?.name || "Restaurant"}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Feather name="log-out" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="delivery-dining" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Orders to be Delivered</Text>
          </View>

          {orders.length > 0 ? (
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={renderOrder}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noOrders}>
              <View style={styles.emptyIconContainer}>
                <Feather name="inbox" size={60} color="#BDBDBD" />
              </View>
              <Text style={styles.noOrdersTitle}>No Pending Orders</Text>
              <Text style={styles.noOrdersText}>New orders will appear here</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E91E63" },
  container: { flex: 1, backgroundColor: "#F5F7FF" },
  header: { paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcomeText: { fontSize: 14, color: "rgba(255, 255, 255, 0.8)", marginBottom: 4 },
  restaurantName: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
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
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1A1D1F" },
  list: { padding: 20, paddingTop: 10 },
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
  orderHeaderLeft: { flexDirection: "column" },
  orderId: { fontSize: 16, fontWeight: "700", color: "#1A1D1F", marginBottom: 4 },
  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 13, fontWeight: "600", marginLeft: 4 },
  priceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  priceText: { fontSize: 14, fontWeight: "700" },
  orderContent: { padding: 16 },
  addressContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  addressIcon: { marginRight: 6 },
  deliveryAddress: { fontSize: 14, color: "#424242", flex: 1 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  itemsTitle: { fontSize: 14, fontWeight: "600", color: "#1A1D1F", marginBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E91E63", marginRight: 8 },
  itemName: { fontSize: 14, color: "#424242", flex: 1 },
  itemQuantity: { fontSize: 14, fontWeight: "600", color: "#1A1D1F" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FF" },
  loadingText: { marginTop: 12, color: "#757575", fontSize: 16 },
  noOrders: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noOrdersTitle: { fontSize: 18, fontWeight: "600", color: "#424242", marginBottom: 8 },
  noOrdersText: { fontSize: 14, color: "#757575" },
})
