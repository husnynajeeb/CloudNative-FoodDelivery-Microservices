import { View, Text, TouchableOpacity, TextInput, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import axiosOrder from '../lib/axiosOrder'; // Axios instance for Order-service
import { useState } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, restaurantName, restaurantId, clearCart } = useCartStore();
  const { user } = useAuthStore(); // ✅ Get logged in user
  console.log('user', user);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = 99;
  const serviceFee = 125;
  const total = subtotal + deliveryFee + serviceFee;

  const placeOrder = async () => {
    if (!street || !city || !zip) {
      alert('Please fill address details');
      return;
    }
    console.log('Placing order...',user?.id);
    try {
      const payload = {
        customerId: user?.id,
        restaurantId: restaurantId,
        items: cartItems.map(item => ({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: subtotal,
        deliveryAddress: { street, city, zip },
        location: {
          type: "Point",
          coordinates: [79.8612, 6.9271] // Later replace with GPS
        }
      };

      const res = await axiosOrder.post('/orders', payload);

      console.log('✅ Order Placed:', res.data);

      clearCart();
      router.replace('/home');
    } catch (err) {
      console.error('❌ Failed to place order:', err.message);
      alert('Order failed');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.itemsCount}>{cartItems.length} items</Text>
        </View>

        {/* Cart Items */}
        {cartItems.map(item => (
          <View key={item._id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        {/* Address Form */}
        <View style={styles.form}>
          <Text style={styles.addressTitle}>Delivery Address</Text>

          <TextInput
            placeholder="Street"
            value={street}
            onChangeText={setStreet}
            style={styles.input}
          />
          <TextInput
            placeholder="City"
            value={city}
            onChangeText={setCity}
            style={styles.input}
          />
          <TextInput
            placeholder="Zip Code"
            value={zip}
            onChangeText={setZip}
            style={styles.input}
            keyboardType="number-pad"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>LKR {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Delivery Fee</Text>
            <Text>LKR {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Service Fee</Text>
            <Text>LKR {serviceFee.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Total</Text>
            <Text style={styles.totalText}>LKR {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={placeOrder}
        >
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  restaurantInfo: {
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  itemsCount: {
    color: '#555',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#111',
  },
  itemPrice: {
    fontSize: 16,
    color: '#111',
  },
  form: {
    marginVertical: 24,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  summary: {
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  totalText: {
    fontWeight: '700',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
