import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
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
        setEta(etaValue);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.post('http://192.168.1.3:5001/api/orders/add', {driverId:user?.id},{
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
      
    } catch (error) {
      console.error('Error fetching order details:', error.message);
      console.error('Error response:', error.response ? error.response.data : 'No response');
    }
  };
 

  const updateOrderStatus = async (id, status) => {
    try {
     await axios.patch(
        `http://192.168.1.3:5001/api/orders/${id}/status`,{status},
         { headers: { Authorization: `Bearer ${token}` } }
      );
       setOrderStatus(status);
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
        (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(coords);
        }
      );
    })();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

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
            {nearestRestaurant && !hasPickedUp && (
              <Marker coordinate={nearestRestaurant}>
                <View style={styles.restaurantMarker}>
                  <FontAwesome name="building" size={20} color="#fff" />
                </View>
              </Marker>
            )}
            {hasPickedUp && customerAddress && (
              <Marker coordinate={customerAddress}>
                <View style={styles.restaurantMarker}>
                  <FontAwesome name="user" size={20} color="#fff" />
                </View>
              </Marker>
            )}
            {routeCoordinates.length > 0 && (
              <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF6347" />
            )}
          </MapView>
        </Animated.View>
      )}
      <View style={styles.infoPanel}>
        <View style={styles.infoBox}>
          <FontAwesome name="clock-o" size={20} color="#444" />
          <Text style={styles.infoText}>ETA: {eta || '...'}</Text>
        </View>
        <View style={styles.infoBox}>
          <FontAwesome name="info-circle" size={20} color="#444" />
          <Text style={styles.infoText}>Status: {orderStatus}</Text>
        </View>
        {(orderStatus === 'OUT_FOR_DELIVERY' || orderStatus === 'DELIVERED') && (
          <View style={styles.infoBox}>
            <FontAwesome name="money" size={20} color="#444" />
            <Text style={styles.infoText}>COD: Rs. {amountDue}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  mapContainer: { flex: 1, overflow: 'hidden' },
  map: { ...StyleSheet.absoluteFillObject },
  restaurantMarker: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});