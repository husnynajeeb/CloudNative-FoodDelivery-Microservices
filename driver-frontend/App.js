// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginDelivery from "./screens/LoginDelivery";
import RegisterDelivery from "./screens/RegisterDelivery";
import DeliveryScreen from "./screens/TrackDeliveryScreen"; // example screen after login

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginDelivery">
        <Stack.Screen name="LoginDelivery" component={LoginDelivery} />
        <Stack.Screen name="RegisterDelivery" component={RegisterDelivery} />
        <Stack.Screen name="TrackDeliveryScreen" component={DeliveryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}