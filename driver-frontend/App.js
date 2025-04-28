// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginDelivery from "./screens/LoginDelivery";
import RegisterDelivery from "./screens/RegisterDelivery";
import TrackDeliveryScreen from "./screens/TrackDeliveryScreen";
import DriverTabs from "./screens/DriverTabs";
import DriverProfileScreen from "./screens/DriverProfileScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginDelivery">
        <Stack.Screen name="LoginDelivery" component={LoginDelivery} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterDelivery" component={RegisterDelivery} options={{ headerShown: false }} />
        <Stack.Screen name="TrackDeliveryScreen" component={TrackDeliveryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DriverTabs" component={DriverTabs} options={{ headerShown: false }} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
