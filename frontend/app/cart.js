import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import useCartStore from "../store/cartStore"; // ✅ Import Cart Store

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    incrementItem,
    decrementItem,
    clearCart,
    restaurantName,
    restaurantId,
  } = useCartStore();

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty 🛒</Text>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={styles.homeButton}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 🏪 Restaurant Name */}
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
            {restaurantName}
          </Text>
          {cartItems.map((item) => (
            <View key={item._id} style={styles.itemContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  LKR {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>

              <View style={styles.counterContainer}>
                <TouchableOpacity onPress={() => decrementItem(item._id)}>
                  <Text style={styles.counterButton}>➖</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => incrementItem(item._id)}>
                  <Text style={styles.counterButton}>➕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* ➕ Add More Items Button - aligned to right */}
          <View style={{ alignItems: "flex-end", marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => router.push(`/restaurant/${restaurantId}`)}
              style={{
                backgroundColor: "#111",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                ➕ Add Items
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Total Price + Checkout Button */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>
          Total: LKR {totalAmount.toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => {
            router.push("/checkout"); // ✅ Just go to checkout page
          }}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  itemPrice: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    paddingHorizontal: 8,
    height: 36,
  },
  counterButton: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: "#111",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    marginBottom: 16,
    color: "#555",
  },
  homeButton: {
    backgroundColor: "#3E64FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
