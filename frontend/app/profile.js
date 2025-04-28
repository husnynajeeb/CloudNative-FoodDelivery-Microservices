import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import useAuthStore from "../store/authStore"; // Your auth store
import { Pencil } from "lucide-react-native"; // ✏️ Edit Icon

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleDelete = async () => {
    try {
      await axios.delete('/auth/delete-profile'); // ✅ Delete profile
      logout(); // ✅ Clear token and user from store
      router.replace('/'); // ✅ Redirect to login page
    } catch (err) {
      console.error('❌ Failed to delete profile:', err.message);
      alert('Failed to delete account');
    }
  };  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Heading */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>My Profile</Text>

          {/* ✏️ Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/profile-edit")} // Create profile-edit page separately
          >
            <Pencil size={20} color="#3E64FF" />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || "N/A"}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone || "N/A"}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || "N/A"}</Text>

          {user?.address && (
            <>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{user.address}</Text>
            </>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/orders")}
        >
          <Text style={styles.buttonText}>View My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#DC2626" }]}
          onPress={() => {
            logout();
            router.replace("/index");
          }}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  editButton: {
    backgroundColor: "#E0E7FF",
    padding: 8,
    borderRadius: 50,
  },
  infoContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3E64FF",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
