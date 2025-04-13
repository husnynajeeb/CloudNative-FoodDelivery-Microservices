import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import io from 'socket.io-client';

const API_URL = 'http://192.168.1.3:5000'; // Your backend IP
const socket = io(API_URL);

export default function TrackScreen() {
  const [orderData, setOrderData] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState('');
  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setETA] = useState(null);

  const [animatedDriverLocation, setAnimatedDriverLocation] = useState(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  );

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/api/delivery/orders`);
    const data = await res.json();
    const latestOrder = data[data.length - 1];
    setOrderData(latestOrder);
  };

  const fetchDrivers = async () => {
    const res = await fetch(`${API_URL}/api/delivery/drivers`);
    const data = await res.json();
    setDrivers(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();

    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    // Order assignment logic
    socket.on('orderAssigned', async (data) => {
      console.log('📦 Order assigned:', data);
      setOrderData(data.order);
      setStatus(data.order.status);

      const res = await fetch(`${API_URL}/api/delivery/track/${data.order._id}`);
      const track = await res.json();

      if (track.driverLocation) {
        const coords = {
          latitude: track.driverLocation.coordinates[1],
          longitude: track.driverLocation.coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        animatedDriverLocation.setValue(coords);
      }

      if (track.route) setRouteCoords(track.route);
      if (track.eta) setETA(track.eta);
    });

    // Update driver location when socket sends updates
    socket.on('driverLocationUpdated', (data) => {
      console.log('🚗 Driver location update:', data);
      if (orderData && data.driverId === orderData.driverId) {
        animatedDriverLocation.timing({
          latitude: data.coordinates[1],
          longitude: data.coordinates[0],
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    });

    // New driver created and added to the list
    socket.on('driverCreated', (newDriver) => {
      console.log('👨‍✈️ New driver created via socket:', newDriver);
      setDrivers(prev => [...prev, newDriver]);
    });

    return () => {
      socket.off('orderAssigned');
      socket.off('driverLocationUpdated');
      socket.off('driverCreated');
    };
  }, [orderData]);

  // Polling every 5s for status and location updates
  useEffect(() => {
    if (!orderData?._id) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${API_URL}/api/delivery/track/${orderData._id}`);
      const data = await res.json();

      if (data.driverLocation) {
        const newCoords = {
          latitude: data.driverLocation.coordinates[1],
          longitude: data.driverLocation.coordinates[0],
        };
        animatedDriverLocation.timing({
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }

      if (data.route) setRouteCoords(data.route);
      if (data.eta) setETA(data.eta);
      setStatus(data.status);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderData]);

  // Alert when order is delivered
  useEffect(() => {
    if (status === 'delivered') {
      Alert.alert("✅ Order Delivered", "Your order has been delivered successfully!");
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
        initialRegion={{
          latitude: 7.8731,
          longitude: 80.7718,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {/* Available drivers */}
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

        {/* Animated Driver */}
        <Marker.Animated
          coordinate={animatedDriverLocation}
          title="Driver"
          pinColor="blue"
        >
          <Icon name="car" size={30} color="blue" />
        </Marker.Animated>

        {/* Delivery location */}
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

        {/* Route Polyline */}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="red" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
}
