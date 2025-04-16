import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const restaurants = [
  { id: 1, name: 'Restaurant A', latitude: 7.29233, longitude: 80.635105 },
];

const customerAddress = { latitude: 7.293935, longitude: 80.638335 };
const GOOGLE_API_KEY = 'AIzaSyAi3F_nxCXmU6kcTP0KFXw4B4AsW-E-8jk';

const mapStyle = [ /* Your map style array here */ ];

export default function DriverTrackScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestRestaurant, setNearestRestaurant] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [hasPickedUp, setHasPickedUp] = useState(false);
  const [eta, setEta] = useState(null);
  const [orderStatus, setOrderStatus] = useState('READY_FOR_PICKUP');
  const [amountDue, setAmountDue] = useState(1500); // Rs.1500 COD
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getDirections = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
        setEta(data.routes[0].legs[0].duration.text); // Set ETA

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(points, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const decodePolyline = (encoded) => {
    return polyline.decode(encoded).map(([latitude, longitude]) => ({ latitude, longitude }));
  };

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
    if (currentLocation && !hasPickedUp) {
      let closest = null;
      let minDistance = Infinity;
      restaurants.forEach((restaurant) => {
        const distance = haversineDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          closest = restaurant;
        }
      });
      if (minDistance < 2000) {
        setNearestRestaurant(closest);
        setOrderStatus('READY_FOR_PICKUP');
      } else {
        setNearestRestaurant(null);
        setRouteCoordinates([]);
      }
    }
  }, [currentLocation, hasPickedUp]);

  useEffect(() => {
    if (currentLocation && nearestRestaurant && !hasPickedUp) {
      getDirections(currentLocation, nearestRestaurant);
    }
  }, [currentLocation, nearestRestaurant, hasPickedUp]);

  useEffect(() => {
    if (currentLocation && nearestRestaurant && !hasPickedUp) {
      const distance = haversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        nearestRestaurant.latitude,
        nearestRestaurant.longitude
      );
      if (distance < 2) {
        Alert.alert('Confirm Pickup', 'Do you want to confirm Pickup?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              setHasPickedUp(true);
              setOrderStatus('OUT_FOR_DELIVERY');
              getDirections(currentLocation, customerAddress);
            },
          },
        ]);
      }
    }
  }, [currentLocation, nearestRestaurant]);

  useEffect(() => {
    if (hasPickedUp && currentLocation) {
      const distance = haversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        customerAddress.latitude,
        customerAddress.longitude
      );
      if (distance < 2) {
        Alert.alert('Complete Delivery', `Collect Rs. ${amountDue}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              setOrderStatus('DELIVERED');
              setRouteCoordinates([]);
              setEta(null);
            },
          },
        ]);
      }
    }
  }, [currentLocation, hasPickedUp]);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (currentLocation) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [currentLocation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={mapStyle}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          rotateEnabled
          initialRegion={
            currentLocation
              ? {
                  ...currentLocation,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }
              : {
                  latitude: 7.8731,
                  longitude: 80.7718,
                  latitudeDelta: 5,
                  longitudeDelta: 5,
                }
          }
        >
          {nearestRestaurant && !hasPickedUp && (
            <Marker coordinate={nearestRestaurant}>
              <View style={styles.restaurantMarker}>
                <FontAwesome name="building" size={20} color="#fff" />
              </View>
            </Marker>
          )}

          {hasPickedUp && (
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
    justify: 'center',
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
