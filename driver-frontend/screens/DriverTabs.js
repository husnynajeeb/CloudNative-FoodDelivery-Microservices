import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TrackDeliveryScreen from './TrackDeliveryScreen'; 
import DriverProfileScreen from './DriverProfileScreen'; 
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'TrackDelivery') {
            iconName = 'map';
          } else if (route.name === 'DriverProfile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#4a80f5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="TrackDelivery" component={TrackDeliveryScreen} />
      <Tab.Screen name="DriverProfile" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
}
