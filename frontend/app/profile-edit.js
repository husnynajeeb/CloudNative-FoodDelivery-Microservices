import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "../lib/axiosInstance"; // ✅ Your axios instance
import useAuthStore from "../store/authStore";
import Toast from "react-native-toast-message"; // ✅ New import
import { ArrowLeft } from "lucide-react-native";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, login } = useAuthStore(); // login() will update local user data after edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
      });
      return;
    }
  
    try {
      setLoading(true);
  
      const res = await axios.put(`/auth/update-profile`, formData);
      console.log("✅ Profile updated:", res.data);
  
      const updatedToken = res.data.token;
      const updatedUser = res.data.user;
  
      if (!updatedToken || !updatedUser) {
        throw new Error("Missing updated token or user in response");
      }
  
      // Save new token + updated user to auth store
      await login(updatedToken, updatedUser);
  
      Toast.show({
        type: "success",
        text1: "Profile updated!",
      });
  
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      console.error("❌ Failed updating profile:", err.message);
  
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E64FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={styles.backButton}
      >
        <ArrowLeft size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.header}>Edit Profile</Text>

      <TextInput
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        style={styles.input}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}
      >
        <Text style={styles.updateButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Toast container */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: "#3E64FF",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  updateButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginBottom: 12,
  },
});
