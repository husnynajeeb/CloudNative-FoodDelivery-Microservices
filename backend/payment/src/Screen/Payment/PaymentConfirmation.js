import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ConfirmationScreen = ({ route, navigation }) => {
  const { paymentMethod } = route.params;

  const purchaseSummary = {
    itemsTotal: 52.99,
    deliveryFee: 5.00,
    total: 57.99,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Payment</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Text style={styles.paymentMethod}>{paymentMethod}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Purchase Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Items Total</Text>
          <Text style={styles.value}>${purchaseSummary.itemsTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Delivery Fee</Text>
          <Text style={styles.value}>${purchaseSummary.deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.label, styles.totalLabel]}>Total</Text>
          <Text style={[styles.value, styles.totalValue]}>${purchaseSummary.total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => alert('Payment Confirmed!')}>
        <Text style={styles.buttonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#334155',
  },
  paymentMethod: {
    fontSize: 15,
    color: '#1E293B',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#475569',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#10B981',
  },
  button: {
    marginTop: 'auto',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
