"use client"

import { useState } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import axios from "../lib/axiosInstance" // make sure path is correct

export default function RegisterDelivery() {
  const navigation = useNavigation()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert("Validation", "Please fill in all required fields: Name, Phone, Password.")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post("/auth/register/driver", {
        name,
        phone,
        email,
        password,
        role: "delivery", // Required by your backend
        vehicleType,
        vehiclePlate,
        address: "", // optional for now
        profilePicture: "", // optional default
        location: {
          type: "Point",
          coordinates: [0, 0], // default coordinates
        },
      })

      if (res.status === 201) {
        Alert.alert("Success", "Registration successful! Please login.")
        navigation.replace("LoginDelivery")
      }
    } catch (err) {
      console.log("Register Error:", err) // Log full error
      console.log("Error response:", err.response?.data) // Log backend response if available
      Alert.alert("Registration failed", err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/thumbnails/004/975/153/small_2x/driver-color-icon-transportation-service-isolated-illustration-vector.jpg",
          }}
          style={styles.logo}
        />
      </View>

      <Text style={styles.heading}>Driver Registration</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name*</Text>
          <TextInput
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number*</Text>
          <TextInput
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password*</Text>
          <TextInput
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle Type</Text>
          <TextInput
            placeholder="Car, Motorcycle, etc."
            value={vehicleType}
            onChangeText={setVehicleType}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle Plate Number</Text>
          <TextInput
            placeholder="Enter vehicle plate number"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            style={styles.input}
            autoCapitalize="characters"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>REGISTER</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => navigation.navigate("LoginDelivery")}>
          Already have an account? <Text style={styles.linkHighlight}>Login here</Text>
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    borderRadius: 75,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#4a80f5",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  linkHighlight: {
    color: "#4a80f5",
    fontWeight: "bold",
  },
})
