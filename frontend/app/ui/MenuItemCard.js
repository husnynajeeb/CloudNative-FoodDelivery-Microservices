import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, Minus } from "lucide-react-native";
import { useState, useEffect } from "react";
import useCartStore from "../../store/cartStore"; // ✅ Import cart store

export default function MenuItemCard({ item, onAdd }) {
  const { cartItems, incrementItem, decrementItem } = useCartStore();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const cartItem = cartItems.find((i) => i._id === item._id);
    setQuantity(cartItem?.quantity || 0);
  }, [cartItems]);

  const handleAdd = () => {
    if (quantity === 0) {
      onAdd(); // ✅ Not addToCart() directly
    } else {
      incrementItem(item._id);
    }
  };

  const handleRemove = () => {
    decrementItem(item._id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>LKR {item.price.toFixed(2)}</Text>
      </View>

      {quantity === 0 ? (
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Plus size={18} color="#111" />
        </TouchableOpacity>
      ) : (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={handleRemove}>
            <Minus size={18} color="#111" />
          </TouchableOpacity>
          <Text style={styles.count}>{quantity}</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Plus size={18} color="#111" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111",
  },
  price: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    paddingHorizontal: 8,
    height: 36,
  },
  count: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
});
