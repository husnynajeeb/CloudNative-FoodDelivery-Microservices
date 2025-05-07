"use client"

import { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Location from "expo-location"
import polyline from "@mapbox/polyline"
import io from "socket.io-client"
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
const SOCKET_URL = "http://192.168.1.3:5004" // Your delivery socket server
const GOOGLE_API_KEY = "AIzaSyAi3F_nxCXmU6kcTP0KFXw4B4AsW-E-8jk" // make sure this is secured!
const BASE_IP = "192.168.1.3"

const CustomerTrackScreen = () => {
  const { orderId } = useLocalSearchParams() // Get orderId from query
  const router = useRouter() // Add router for navigation
  const [driverId, setDriverId] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [restaurantLocation, setRestaurantLocation] = useState(null)
  const [orderLocation, setOrderLocation] = useState(null) // For order delivery location
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [eta, setEta] = useState(null)
  const [distance, setDistance] = useState(null)
  const [orderDelivered, setOrderDelivered] = useState(false)
  const [restaurantName, setRestaurantName] = useState("Restaurant")
  const [customerName, setCustomerName] = useState("You")
  const [deliveryTime, setDeliveryTime] = useState(null)

  const socket = useRef(null)
  const mapRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const notificationAnim = useRef(new Animated.Value(0)).current

  // Fetch customer's current location
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        console.log("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setCustomerLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    })()
  }, [])

  // Connect to WebSocket and listen for driver's live updates
  useEffect(() => {
    if (!driverId) return

    socket.current = io(SOCKET_URL)

    socket.current.on("connect", () => {
      console.log("✅ Connected to socket server")
    })

    socket.current.on("driverLocationUpdated", (data) => {
      if (data.driverId === driverId) {
        const [lng, lat] = data.coordinates
        setDriverLocation({
          latitude: lat,
          longitude: lng,
        })
      }
    })

    return () => {
      if (socket.current) {
        socket.current.disconnect()
      }
    }
  }, [driverId])

  // Fetch order tracking info
  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const response = await fetch(`http://${BASE_IP}:5001/api/orders/${orderId}/tracking`)
        const tracking = await response.json()
        console.log("📦 Tracking API response:", tracking)

        if (tracking.driverLocation) {
          setDriverLocation({
            latitude: tracking.driverLocation.latitude,
            longitude: tracking.driverLocation.longitude,
          })
        }

        if (tracking.restaurantLocation) {
          setRestaurantLocation({
            latitude: tracking.restaurantLocation.latitude,
            longitude: tracking.restaurantLocation.longitude,
          })

          // Set restaurant name if available
          if (tracking.restaurantName) {
            setRestaurantName(tracking.restaurantName)
          }
        }

        if (tracking.orderLocation) {
          setOrderLocation({
            latitude: tracking.orderLocation.latitude,
            longitude: tracking.orderLocation.longitude,
          })
        }

        if (tracking.driverId) {
          setDriverId(tracking.driverId)
          console.log("Frontend is listening for driverId:", tracking.driverId)
        }
      } catch (error) {
        console.error("Failed to fetch tracking info:", error)
      }
    }

    if (orderId) {
      fetchOrderTracking()
    }
  }, [orderId])

  // Fetch Google Directions between driver and order location
  const fetchRoute = async (origin, destination) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.routes.length > 0) {
        const points = polyline
          .decode(data.routes[0].overview_polyline.points)
          .map(([latitude, longitude]) => ({ latitude, longitude }))
        setRouteCoordinates(points)
        setEta(data.routes[0].legs[0].duration.text) // ETA from Google API
        setDistance(data.routes[0].legs[0].distance.text) // Distance from Google API
      }
    } catch (error) {
      console.error("Error fetching directions:", error)
    }
  }

  // Calculate distance between two coordinates in kilometers
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180
    const R = 6371e3 // meters
    const φ1 = toRad(lat1)
    const φ2 = toRad(lat2)
    const Δφ = toRad(lat2 - lat1)
    const Δλ = toRad(lon2 - lon1)
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Show delivery notification animation
  const showDeliveryNotification = () => {
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setDeliveryTime(formattedTime)

    Animated.sequence([
      Animated.timing(notificationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(5000),
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Re-fetch route if either driver or order location changes
  useEffect(() => {
    if (driverLocation && orderLocation) {
      fetchRoute(driverLocation, orderLocation)

      // Check if driver has reached destination (within 50 meters)
      const distance = haversineDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        orderLocation.latitude,
        orderLocation.longitude,
      )

      if (distance < 30 && !orderDelivered) {
        setOrderDelivered(true)
        showDeliveryNotification()
      }
    }
  }, [driverLocation, orderLocation])

  // Fade in animation for map
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  // Handle back button press
  const handleBackPress = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          region={
            orderLocation
              ? {
                  ...orderLocation,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }
              : customerLocation
                ? {
                    ...customerLocation,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  }
                : undefined
          }
        >
          {driverLocation && (
            <Marker coordinate={driverLocation} title="Driver">
              <View style={styles.driverMarker}>
                <FontAwesome5 name="motorcycle" size={18} color="#fff" />
              </View>
            </Marker>
          )}

          {customerLocation && (
            <Marker coordinate={customerLocation} title="You">
              <View style={styles.customerMarker}>
                <FontAwesome5 name="user-location" size={18} color="#fff" />
              </View>
            </Marker>
          )}

          {restaurantLocation && (
            <Marker coordinate={restaurantLocation} title={restaurantName}>
              <View style={styles.restaurantMarker}>
                <MaterialIcons name="restaurant" size={20} color="#fff" />
              </View>
            </Marker>
          )}

          {orderLocation && (
            <Marker coordinate={orderLocation} title="Delivery Location">
              <View style={styles.orderMarker}>
                <FontAwesome5 name="home" size={18} color="#fff" />
              </View>
            </Marker>
          )}

          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF6347" />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            if (mapRef.current && orderLocation) {
              mapRef.current.animateToRegion({
                ...orderLocation,
                latitudeDelta: LATITUDE_DELTA / 2,
                longitudeDelta: LONGITUDE_DELTA / 2,
              })
            }
          }}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Delivery notification */}
      <Animated.View style={[styles.deliveryNotification, { opacity: notificationAnim }]}>
        <View style={styles.notificationIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </View>
        <Text style={styles.deliveryText}>Your order has been delivered!</Text>
      </Animated.View>

      <View style={styles.infoPanel}>
        <View style={styles.infoPanelHeader}>
          <Text style={styles.infoPanelTitle}>{orderDelivered ? "Order Delivered" : "Order Tracking"}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={orderDelivered ? "checkmark-circle" : "time-outline"}
                size={22}
                color={orderDelivered ? "#2ecc71" : "#3498db"}
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>{orderDelivered ? "Delivered At" : "ETA"}</Text>
              <Text style={styles.infoText}>
                {orderDelivered ? deliveryTime || "Just now" : eta || "Calculating..."}
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="navigate-outline" size={22} color="#3498db" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoText}>{distance || "Calculating..."}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="restaurant" size={22} color="#e74c3c" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Restaurant</Text>
              <Text style={styles.infoText}>{restaurantName}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="home" size={18} color="#2ecc71" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoText}>Your Location</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Back button styles
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "#3498db",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  driverMarker: {
    backgroundColor: "#3498db",
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  restaurantMarker: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  customerMarker: {
    backgroundColor: "#3498db",
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  orderMarker: {
    backgroundColor: "#2ecc71",
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  recenterButton: {
    position: "absolute",
    bottom: 200,
    right: 16,
    backgroundColor: "#3498db",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  deliveryNotification: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#2ecc71",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    width: width * 0.9,
  },
  notificationIcon: {
    marginRight: 10,
  },
  deliveryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoPanel: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  infoPanelHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#95a5a6",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
})

export default CustomerTrackScreen
