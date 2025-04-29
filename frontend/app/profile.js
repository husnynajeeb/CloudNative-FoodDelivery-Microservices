import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LogOut, Edit2 } from "lucide-react-native";
import useAuthStore from "../store/authStore"; // ✅ Your login state

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Deleting Account...");
            logout();
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push("/profile-edit"); // ✅ Navigate to profile-edit page
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Edit2 size={22} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture Placeholder */}
        <View style={styles.profileImage}>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#3E64FF" }}>
            {user?.name?.charAt(0) || "U"}
          </Text>
        </View>

        {/* Welcome */}
        <Text style={styles.welcomeText}>
          Welcome, {user?.name || "User"} 👋
        </Text>

        {/* Profile Info */}
        <View style={styles.infoCard}>
          <InfoRow label="Name" value={user?.name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Phone" value={user?.phone} />
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        
        {/* ✅ Log Out Button */}
        <View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace("/");
            }}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  dangerZone: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#3E64FF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
