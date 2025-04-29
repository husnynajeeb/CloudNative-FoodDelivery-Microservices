import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular as Poppins_Regular,
  Poppins_500Medium as Poppins_Medium,
  Poppins_600SemiBold as Poppins_SemiBold,
} from "@expo-google-fonts/poppins";
import {
  ChevronLeft,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Home,
} from "lucide-react-native";
import axios from "../lib/axiosInstance";
import theme from "../app/constants/theme";
import FormInput from "../app/ui/Input";
import Button from "../app/ui/Button";
import LinkText from "../app/ui/LinkText";
import ProgressBar from "../app/ui/ProgressBar";
import KeyboardAvoidingWrapper from "../app/ui/KeyboardAvoidingWrapper";
import { SplashScreen } from "expo-router";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RegisterCustomer() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 5;

  // Font loading
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": Poppins_Regular,
    "Poppins-Medium": Poppins_Medium,
    "Poppins-SemiBold": Poppins_SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null until the fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Calculate the form completion progress
  const getProgress = () => {
    const fieldsCompleted = Object.values(form).filter(
      (value) => value.trim() !== ""
    ).length;
    return fieldsCompleted / totalSteps;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Name is required";
    if (!form.phone) newErrors.phone = "Phone number is required";
    if (!form.address) newErrors.address = "Address is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.42.110:5000/api/auth/register/customer",
        form
      );
      // Show success animation
      setIsLoading(false);
      router.replace("/");
    } catch (err) {
      setIsLoading(false);
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      // Handle specific errors if provided by the backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear the error for this field when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // Icons for form fields
  const getFieldIcon = (field) => {
    switch (field) {
      case "name":
        return <UserIcon size={20} color={theme.colors.icon} />;
      case "phone":
        return <Phone size={20} color={theme.colors.icon} />;
      case "address":
        return <Home size={20} color={theme.colors.icon} />;
      case "email":
        return <Mail size={20} color={theme.colors.icon} />;
      case "password":
        return <Lock size={20} color={theme.colors.icon} />;
      default:
        return null;
    }
  };

  // Label text for form fields
  const getFieldLabel = (field) => {
    switch (field) {
      case "name":
        return "Full Name";
      case "phone":
        return "Phone Number";
      case "address":
        return "Delivery Address";
      case "email":
        return "Email Address";
      case "password":
        return "Password";
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  // Keyboard type for form fields
  const getKeyboardType = (field) => {
    switch (field) {
      case "email":
        return "email-address";
      case "phone":
        return "phone-pad";
      default:
        return "default";
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {Math.round(getProgress() * 100)}% Complete
        </Text>
        <ProgressBar progress={getProgress()} />
      </View>

      <Text style={styles.subtitle}>
        Sign up as a customer to order delicious food from your favorite
        restaurants.
      </Text>

      <View style={styles.formContainer}>
        {Object.keys(form).map((field) => (
          <FormInput
            key={field}
            label={getFieldLabel(field)}
            placeholder={`Enter your ${field}`}
            secureTextEntry={field === "password"}
            value={form[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            error={errors[field]}
            autoCapitalize={field === "name" ? "words" : "none"}
            keyboardType={getKeyboardType(field)}
            leftIcon={getFieldIcon(field)}
          />
        ))}

        <Button
          title="Create Account"
          onPress={handleRegister}
          isLoading={isLoading}
          fullWidth
          style={styles.registerButton}
        />

        <View style={styles.loginLinkContainer}>
          <Text style={styles.linkText}>Already have an account?</Text>
          <LinkText
            text="Sign In"
            onPress={() => router.replace("/")}
            style={styles.loginLink}
          />
        </View>

        <TouchableOpacity
          style={styles.restaurantLink}
          onPress={() => router.push("/register-restaurant")}
        >
          <Text style={styles.restaurantLinkText}>
            Want to register as a Restaurant?
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: theme.colors.secondaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: theme.colors.secondaryText,
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: "100%",
  },
  registerButton: {
    marginTop: 16,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  linkText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  loginLink: {
    marginLeft: 4,
    fontSize: 14,
  },
  restaurantLink: {
    marginTop: 32,
    padding: 16,
    backgroundColor: theme.colors.buttonSecondary,
    borderRadius: 12,
    alignItems: "center",
  },
  restaurantLinkText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: theme.colors.text,
  },
});
