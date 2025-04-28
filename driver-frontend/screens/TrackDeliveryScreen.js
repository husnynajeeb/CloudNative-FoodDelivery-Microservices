import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, StyleSheet, Dimensions, Animated, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import axios from '../lib/axiosInstance';
import useAuthStore from '../store/authStore';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_API_KEY = 'AIzaSyAi3F_nxCXmU6kcTP0KFXw4B4AsW-E-8jk'; // make sure this is secured!

export default function DriverTrackScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestRestaurant, setNearestRestaurant] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [hasPickedUp, setHasPickedUp] = useState(false);
  const [orderStatus, setOrderStatus] = useState('READY_FOR_PICKUP');
  const [amountDue, setAmountDue] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [customerName, setCustomerName] = useState("Customer");
  const [deliveryTime, setDeliveryTime] = useState(null);

  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { token, user } = useAuthStore((state) => state);
  const driverId = user?._id || user?.id;
  console.log(user)

  const decodePolyline = (encoded) =>
    polyline.decode(encoded).map(([latitude, longitude]) => ({ latitude, longitude }));

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371e3; // meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDirections = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        const etaValue = data.routes[0].legs[0].duration.text;
        const distanceValue = data.routes[0].legs[0].distance.text;
        setEta(etaValue);
        setDistance(distanceValue);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.post('http://192.168.106.55:5001/api/orders/add', {driverId:user?.id},{
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
        const order = res.data;
        setOrderId(res.data.order._id);
        setOrderStatus(res.data.order.status);
        setAmountDue(res.data.order.totalAmount);
        setNearestRestaurant({
        latitude: res.data.restaurant.location.coordinates[1],
          longitude: res.data.restaurant.location.coordinates[0],
        });
        setCustomerAddress({
          latitude: res.data.order.location.coordinates[1],
          longitude: res.data.order.location.coordinates[0],
        });
        
        // Set restaurant and customer names if available
        if (res.data.restaurant.name) {
          setRestaurantName(res.data.restaurant.name);
        }
        if (res.data.order.customerName) {
          setCustomerName(res.data.order.customerName);
        }
      
    } catch (error) {
      console.error('Error fetching order details:', error.message);
      console.error('Error response:', error.response ? error.response.data : 'No response');
    }
  };
 
  const updateOrderStatus = async (id, status) => {
    try {
     await axios.patch(
        `http://192.168.106.55:5001/api/orders/${id}/status`,{status},
         { headers: { Authorization: `Bearer ${token}` } }
      );
       setOrderStatus(status);
       
       // Set delivery time when order is delivered
       if (status.toUpperCase() === 'DELIVERED') {
         const now = new Date();
         const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         setDeliveryTime(formattedTime);
       }
     } catch (error) {
      console.error('Error updating order status:', error);
     }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    let locationSubscription;
  
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to track your delivery.');
        return;
      }
  
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        async (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          console.log('Updating location:', coords);  // <-- Add this line
          setCurrentLocation(coords);
  
          try {
            const driverId = user?.id || user?._id;
            if (!driverId) return;


            const bodyPayload = {
              coordinates: [coords.longitude, coords.latitude], // GeoJSON format [lng, lat]
            };

            console.log('Sending to backend:', bodyPayload);  // <-- And this
  
            await fetch(`http://192.168.106.55:5003/api/delivery/${driverId}/location`, {
              method: 'PUT', // or POST depending on your API design
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // if your API requires authentication
              },
              body: JSON.stringify(bodyPayload),
              
            });
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        }
      );
    })();
  
    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, [token, user]);


  useEffect(() => {
    if (!currentLocation || !nearestRestaurant) return;

    const distanceToRestaurant = haversineDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nearestRestaurant.latitude,
      nearestRestaurant.longitude
    );

    if (distanceToRestaurant < 50 && !hasPickedUp) {
      Alert.alert('Pickup Order', 'Have you picked up the order?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setHasPickedUp(true);
            updateOrderStatus(orderId, 'out_for_delivery');
            getDirections(currentLocation, customerAddress);
          },
        },
      ]);
    } else if (!hasPickedUp) {
      getDirections(currentLocation, nearestRestaurant);
    }

    if (hasPickedUp && customerAddress) {
      const distanceToCustomer = haversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        customerAddress.latitude,
        customerAddress.longitude
      );

      if (distanceToCustomer < 20) {
        Alert.alert('Complete Delivery', `Collect Rs. ${amountDue}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              updateOrderStatus(orderId, 'DELIVERED');
              setRouteCoordinates([]);
              setEta(null);
            },
          },
        ]);
      }
    }
  }, [currentLocation, hasPickedUp, nearestRestaurant, customerAddress]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getStatusColor = () => {
    switch(orderStatus.toUpperCase()) {
      case 'READY_FOR_PICKUP':
        return '#FFA500'; // Orange
      case 'OUT_FOR_DELIVERY':
        return '#3498db'; // Blue
      case 'DELIVERED':
        return '#2ecc71'; // Green
      default:
        return '#95a5a6'; // Gray
    }
  };

  const getStatusText = () => {
    switch(orderStatus.toUpperCase()) {
      case 'READY_FOR_PICKUP':
        return 'Ready for Pickup';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return "Order Ready for Pickup";
    }
  };

  const getProgressPercentage = () => {
    switch(orderStatus.toUpperCase()) {
      case 'READY_FOR_PICKUP':
        return '33%';
      case 'OUT_FOR_DELIVERY':
        return '66%';
      case 'DELIVERED':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            showsUserLocation
            showsMyLocationButton
            showsCompass
            initialRegion={{
              ...currentLocation,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          >
            {currentLocation && (
              <Marker coordinate={currentLocation}>
                <View style={styles.driverMarker}>
                  <FontAwesome5 name="motorcycle" size={18} color="#fff" />
                </View>
              </Marker>
            )}
            
            {nearestRestaurant && !hasPickedUp && (
              <Marker 
                coordinate={nearestRestaurant}
                title={restaurantName}
                description="Pickup location"
              >
                <View style={styles.restaurantMarker}>
                  <MaterialIcons name="restaurant" size={20} color="#fff" />
                </View>
              </Marker>
            )}
            
            {hasPickedUp && customerAddress && (
              <Marker 
                coordinate={customerAddress}
                title={customerName}
                description="Delivery location"
              >
                <View style={styles.customerMarker}>
                  <FontAwesome5 name="home" size={18} color="#fff" />
                </View>
              </Marker>
            )}
            
            {/* Using the original polyline implementation */}
            {routeCoordinates.length > 0 && (
              <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF6347" />
            )}
          </MapView>
          
          <TouchableOpacity 
            style={styles.recenterButton}
            onPress={() => {
              if (mapRef.current && currentLocation) {
                mapRef.current.animateToRegion({
                  ...currentLocation,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                });
              }
            }}
          >
            <Ionicons name="locate" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      <View style={styles.statusContainer}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <View style={[styles.progressBar, { width: getProgressPercentage(), backgroundColor: getStatusColor() }]} />
          
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, { backgroundColor: orderStatus.toUpperCase() === 'READY_FOR_PICKUP' || orderStatus.toUpperCase() === 'OUT_FOR_DELIVERY' || orderStatus.toUpperCase() === 'DELIVERED' ? getStatusColor() : '#e0e0e0' }]}>
              <MaterialIcons name="restaurant" size={16} color="#fff" />
            </View>
            <View style={[styles.progressStep, { backgroundColor: orderStatus.toUpperCase() === 'OUT_FOR_DELIVERY' || orderStatus.toUpperCase() === 'DELIVERED' ? getStatusColor() : '#e0e0e0' }]}>
              <FontAwesome5 name="motorcycle" size={14} color="#fff" />
            </View>
            <View style={[styles.progressStep, { backgroundColor: orderStatus.toUpperCase() === 'DELIVERED' ? getStatusColor() : '#e0e0e0' }]}>
              <FontAwesome5 name="home" size={14} color="#fff" />
            </View>
          </View>
        </View>
        
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
      
      <View style={styles.infoPanel}>
        <View style={styles.infoPanelHeader}>
          <Text style={styles.infoPanelTitle}>
            {orderStatus.toUpperCase() === 'DELIVERED' ? 'Delivery Complete' : 'Delivery Details'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={orderStatus.toUpperCase() === 'DELIVERED' ? "checkmark-circle" : "time-outline"} 
                size={22} 
                color={orderStatus.toUpperCase() === 'DELIVERED' ? "#2ecc71" : "#3498db"} 
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>
                {orderStatus.toUpperCase() === 'DELIVERED' ? 'Delivered At' : 'ETA'}
              </Text>
              <Text style={styles.infoText}>
                {orderStatus.toUpperCase() === 'DELIVERED' ? (deliveryTime || 'Completed') : (eta || 'Calculating...')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <Ionicons name="navigate-outline" size={22} color="#3498db" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoText}>{distance || 'Calculating...'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name={orderStatus.toUpperCase() === 'DELIVERED' ? "home" : (hasPickedUp ? "home" : "restaurant")} 
                size={22} 
                color="#3498db" 
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>
                {orderStatus.toUpperCase() === 'DELIVERED' ? 'Delivered To' : (hasPickedUp ? 'Delivering To' : 'Pickup From')}
              </Text>
              <Text style={styles.infoText}>
                {orderStatus.toUpperCase() === 'DELIVERED' || hasPickedUp ? customerName : restaurantName}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <View style={styles.iconContainer}>
              <FontAwesome5 
                name={orderStatus.toUpperCase() === 'DELIVERED' ? "check-circle" : "money-bill-wave"} 
                size={18} 
                color={orderStatus.toUpperCase() === 'DELIVERED' ? "#2ecc71" : "#3498db"} 
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>
                {orderStatus.toUpperCase() === 'DELIVERED' ? 'Amount Collected' : 'Amount Due'}
              </Text>
              <Text style={styles.infoText}>Rs. {amountDue}</Text>
            </View>
          </View>
        </View>
        
        {orderStatus.toUpperCase() === 'READY_FOR_PICKUP' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                if (nearestRestaurant) {
                  mapRef.current.animateToRegion({
                    ...nearestRestaurant,
                    latitudeDelta: LATITUDE_DELTA / 2,
                    longitudeDelta: LONGITUDE_DELTA / 2,
                  });
                }
              }}
            >
              <Text style={styles.actionButtonText}>Navigate to Restaurant</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {orderStatus.toUpperCase() === 'OUT_FOR_DELIVERY' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                if (customerAddress) {
                  mapRef.current.animateToRegion({
                    ...customerAddress,
                    latitudeDelta: LATITUDE_DELTA / 2,
                    longitudeDelta: LONGITUDE_DELTA / 2,
                  });
                }
              }}
            >
              <Text style={styles.actionButtonText}>Navigate to Customer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {orderStatus.toUpperCase() === 'DELIVERED' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}
              onPress={() => {
                // Here you would typically navigate to a new order or back to a dashboard
                Alert.alert('Success', 'Delivery completed successfully!');
              }}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  mapContainer: { 
    flex: 1, 
    overflow: 'hidden' 
  },
  map: { 
    ...StyleSheet.absoluteFillObject 
  },
  driverMarker: {
    backgroundColor: '#3498db',
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  restaurantMarker: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  customerMarker: {
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    backgroundColor: '#3498db',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  statusContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  progressBarContainer: {
    height: 40,
    position: 'relative',
    marginBottom: 8,
  },
  progressBarBackground: {
    position: 'absolute',
    top: 19,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  progressBar: {
    position: 'absolute',
    top: 19,
    left: 0,
    height: 3,
    backgroundColor: '#3498db',
    zIndex: 2,
    transition: 'width 0.3s ease',
  },
  progressSteps: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusTextContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  infoPanelHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  actionContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});