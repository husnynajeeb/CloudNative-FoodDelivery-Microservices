import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import io from 'socket.io-client';

const API_URL = 'http://192.168.1.3:5000'; // Your backend IP
const socket = io(API_URL);

export default function TrackScreen() {
  const [drivers, setDrivers] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState('');
  const [eta, setETA] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [animatedDriverLocation] = useState(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  );

  // 🛰️ Watch and emit driver's live location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission not granted');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(coords);

          // 🎯 Emit to server
          socket.emit('updateDriverLocation', {
            driverId: orderData?.driverId || 'temp-driver', // Replace with real driverId if known
            coordinates: [coords.longitude, coords.latitude],
          });

          // Animate marker if it's a delivery driver
          animatedDriverLocation.timing({
            latitude: coords.latitude,
            longitude: coords.longitude,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }
      );
    })();
  }, [orderData]);

  // 🌐 Setup socket listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socket.on('orderAssigned', async (data) => {
      console.log('📦 Order assigned:', data);
      setOrderData(data.order);
      setStatus(data.order.status);

      const res = await fetch(`${API_URL}/api/delivery/track/${data.order._id}`);
      const track = await res.json();

      if (track.driverLocation) {
        animatedDriverLocation.setValue({
          latitude: track.driverLocation.coordinates[1],
          longitude: track.driverLocation.coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      if (track.route) setRouteCoords(track.route);
      if (track.eta) setETA(track.eta);
    });

    socket.on('driverCreated', (newDriver) => {
      setDrivers((prev) => [...prev, newDriver]);
    });

    socket.on('driverLocationUpdated', (data) => {
      if (orderData && data.driverId === orderData.driverId) {
        animatedDriverLocation.timing({
          latitude: data.coordinates[1],
          longitude: data.coordinates[0],
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    });

    return () => {
      socket.off('orderAssigned');
      socket.off('driverCreated');
      socket.off('driverLocationUpdated');
    };
  }, [orderData]);

  // ✅ Alert when delivered
  useEffect(() => {
    if (status === 'delivered') {
      Alert.alert('✅ Order Delivered', 'Your order has been delivered successfully!');
    }
  }, [status]);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: 'center', margin: 10, fontWeight: 'bold' }}>
        {status === 'delivered' ? '🎉 Delivered!' : `Status: ${status}`}
      </Text>
      {eta && <Text style={{ textAlign: 'center' }}>ETA: {eta}</Text>}

      <MapView
        style={{ flex: 1 }}
        initialRegion={
          currentLocation
            ? {
                ...currentLocation,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : {
                latitude: 7.8731,
                longitude: 80.7718,
                latitudeDelta: 5,
                longitudeDelta: 5,
              }
        }
      >
        {/* 🧍 Current user location */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="You are here"
            pinColor="purple"
          >
            <Icon name="user" size={30} color="purple" />
          </Marker>
        )}

        {/* 👨‍✈️ Available drivers */}
        {drivers.map((driver) => (
          <Marker
            key={driver._id}
            coordinate={{
              latitude: driver.location.coordinates[1],
              longitude: driver.location.coordinates[0],
            }}
            title={`Driver: ${driver.name}`}
            pinColor="blue"
          >
            <Icon name="car" size={30} color="blue" />
          </Marker>
        ))}

        {/* 🚘 Animated driver */}
        <Marker.Animated coordinate={animatedDriverLocation} title="Driver" pinColor="blue">
          <Icon name="car" size={30} color="blue" />
        </Marker.Animated>

        {/* 📍 Delivery location */}
        {orderData && (
          <Marker
            coordinate={{
              latitude: orderData.deliveryLocation.coordinates[1],
              longitude: orderData.deliveryLocation.coordinates[0],
            }}
            title="Your Order"
            pinColor="green"
          >
            <Icon name="map-pin" size={30} color="green" />
          </Marker>
        )}

        {/* ➰ Route */}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="red" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
}
