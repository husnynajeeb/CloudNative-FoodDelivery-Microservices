import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Clock } from "lucide-react-native";

export default function RestaurantCard({ image, name, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.meta}>
          <Text style={[styles.fee, { color: "#666", fontSize: 14 }]}>
            රු 44 Delivery Fee
          </Text>

          <Clock size={14} color="#666" style={{ marginLeft: 16 }} />
          <Text style={styles.fee}> 15 min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  fee: {
    color: "#666",
    fontSize: 14,
  },
});
